import { SayFn, MessageEvent } from "@slack/bolt";
import { isSameMonth } from "date-fns";
import {
  getForest,
  getCarbonOffset,
  getCredits,
  plantTree,
} from "../api/more-trees";
import {
  COMPANY_NAME,
  MONTHLY_TREE_BUDGET,
  TREE_EMOJI,
  TREE_EMOJI_NAME,
} from "./constants";
import {
  uploadKudosObjectToS3Bucket,
  getObjectFromS3Bucket,
  IKudosCount,
  listObjectsFromS3Bucket,
} from "./S3-actions";
import { app } from "./slack-app";

const getForestMessage = (
  forest_url: string,
  quantity_gifted: number,
  quantity_planted: number,
) => {
  const totalTrees = quantity_gifted + quantity_planted;

  const treeArray = Array(totalTrees).fill(TREE_EMOJI);
  const lineLength = 5;
  let treeOutput = "";
  for (let i = 0; i < treeArray.length; i += lineLength) {
    treeOutput += treeArray.slice(i, i + lineLength).join("") + "\n";
  }

  return `${COMPANY_NAME} has planted ${totalTrees} trees.
  \nHere is our forest, that you helped plant, in emoji form:
  \n\n${treeOutput}
  \n\nYou can also view our virtual forest on MoreTrees here: ${forest_url}`;
};

export const forestAction = async (say: SayFn) => {
  const res = await getForest();
  if (res) {
    const { forest_url, quantity_gifted, quantity_planted } = res;
    await say(getForestMessage(forest_url, quantity_gifted, quantity_planted));
  }
};

export const carbonAction = async (say: SayFn) => {
  const res = await getCarbonOffset();
  if (res) {
    const { data } = res;
    await say(
      `${TREE_EMOJI} ${COMPANY_NAME} has offset ${
        Math.ceil(data.total_carbon_offset * 100) / 100
      }t of carbon ${TREE_EMOJI}`,
    );
  }
};

export const creditsAction = async (say: SayFn) => {
  const credits = await getCredits();
  await say(
    `${TREE_EMOJI} ${COMPANY_NAME} has ${credits} credits left to plant trees ${TREE_EMOJI}`,
  );
};

export const defaultAction = async (say: SayFn) => {
  await say(
    "You're barking up the wrong tree with that command! Try `/treeumph carbon` to view total carbon offset or `/treeumph forest` to view the virtual forest",
  );
};

export const plantTreeAction = async (message: MessageEvent) => {
  const res = await plantTree();
  if (res) {
    await app.client.reactions.add({
      token: process.env.SLACK_BOT_TOKEN,
      name: TREE_EMOJI_NAME,
      channel: message.channel,
      timestamp: message.ts,
    });
  }
};

const limitMessages = [
  `${TREE_EMOJI} Congrat-yew-lations we have reached the limit for tree planting this month. If you are pining for more make sure to give kudos next month ${TREE_EMOJI}`,
  `${TREE_EMOJI} Branches of congratulations, we have reached our sapling limit for the month. If you're feeling a bit bark-y about it, make sure to give some kudos next month. ${TREE_EMOJI}`,
  `${TREE_EMOJI} Leaf us congratulate you on reaching our tree planting threshold for the month. If you're feeling rooted in the desire for more, be sure to give your fellow Ensonians a shout-out next month! ${TREE_EMOJI}`,
  `${TREE_EMOJI} It's time to raise a bark of congratulations, we've reached our tree planting limit for the month. If you're feeling a little green with envy, don't worry, there will be more opportunities to plant next month. ${TREE_EMOJI}`,
];

export const treeLimitAction = async (say: SayFn) => {
  const randomLimitMessage =
    limitMessages[Math.floor(Math.random() * limitMessages.length)];
  await say(`${randomLimitMessage}`);
};

export const kudosMessageAction = async (
  s3Bucket: AWS.S3,
  bucketName: string,
  message: MessageEvent,
  say: SayFn,
) => {
  const kudosObjectKey = "kudos-count.json";
  const objectList = await listObjectsFromS3Bucket(s3Bucket, bucketName);
  const kudosObject = objectList.find(
    (object) => object?.Key === kudosObjectKey,
  );
  const currentDate = new Date();
  const kudosCountObject: IKudosCount = {
    count: 1,
    date: currentDate.toISOString(),
    slack_ts_reference: message?.ts,
  };

  // Initialise kudos object
  if (!kudosObject) {
    await plantTreeAction(message);
    await uploadKudosObjectToS3Bucket(
      kudosObjectKey,
      kudosCountObject,
      s3Bucket,
      bucketName,
    );
    return;
  }

  const objectString = await getObjectFromS3Bucket(
    kudosObjectKey,
    s3Bucket,
    bucketName,
  );
  const object = JSON.parse(objectString || "{}");

  if (message?.ts === object?.slack_ts_reference) {
    return;
  }

  if (!isSameMonth(currentDate, new Date(object?.date))) {
    await plantTreeAction(message);
    await uploadKudosObjectToS3Bucket(
      kudosObjectKey,
      kudosCountObject,
      s3Bucket,
      bucketName,
    );
    return;
  }

  if (object?.count < MONTHLY_TREE_BUDGET) {
    await plantTreeAction(message);
    await uploadKudosObjectToS3Bucket(
      kudosObjectKey,
      { ...kudosCountObject, count: object?.count + 1 },
      s3Bucket,
      bucketName,
    );
  }

  if (object?.count >= MONTHLY_TREE_BUDGET) {
    await treeLimitAction(say);
  }
};
