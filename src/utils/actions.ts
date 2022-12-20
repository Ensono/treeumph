import { app } from "./slack-app";
import { SayFn, MessageEvent } from "@slack/bolt";
import {
  getForest,
  getCarbonOffset,
  getCredits,
  plantTree,
} from "../api/more-trees";
import { TREE_EMOJI, TREE_EMOJI_NAME, COMPANY_NAME } from "./constants";

const getForestMessage = (forest_url: string, quantity_gifted: number, quantity_planted: number) => {
  return `${TREE_EMOJI} ${COMPANY_NAME} have planted ${
    quantity_planted + quantity_gifted
  } trees. View our virtual forest here: ${forest_url} ${TREE_EMOJI}`
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
  console.log(credits);
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

export const treeLimitAction = async (say: SayFn) => {
  const res = await getForest();
  if (res) {
    const { forest_url, quantity_gifted, quantity_planted } = res;
    await say(
      `${TREE_EMOJI} Congrat-yew-lations we have reached the limit for tree planting this month. If you are pining for more make sure to give kudos next month ${TREE_EMOJI}\n${getForestMessage(forest_url, quantity_gifted, quantity_planted)}`,
    );
  }
};
