import { app } from "./slack-app";
import { SayFn, MessageEvent } from "@slack/bolt";
import {
  getForest,
  getCarbonOffset,
  getCredits,
  plantTree,
} from "../api/more-trees";
import { TREE_EMOJI, TREE_EMOJI_NAME, COMPANY_NAME } from "./constants";

const getForestMessage = (
  forest_url: string,
  quantity_gifted: number,
  quantity_planted: number,
) => {
  return `${TREE_EMOJI} ${COMPANY_NAME} have planted ${
    quantity_planted + quantity_gifted
  } trees. View our virtual forest here: ${forest_url} ${TREE_EMOJI}`;
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
      `${TREE_EMOJI} ${COMPANY_NAME} have offset ${
        Math.ceil(data.total_carbon_offset * 100) / 100
      }t of carbon ${TREE_EMOJI}`,
    );
  }
};

export const creditsAction = async (say: SayFn) => {
  const credits = await getCredits();
  await say(
    `${TREE_EMOJI} ${COMPANY_NAME} have ${credits} credits left to plant trees ${TREE_EMOJI}`,
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
