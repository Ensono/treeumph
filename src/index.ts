import { BotMessageEvent } from "@slack/bolt";
import app from "./utils/slack-app";
import {
  plantTree,
  getCarbonOffset,
  getForest,
  getCredits,
} from "./api/more-trees";
import { HR_BOT_USER_ID, TREE_EMOJI, TREE_EMOJI_NAME } from "./utils/constants";

app.command("/treeumph", async ({ command, ack, say }) => {
  await ack();

  switch (command.text) {
    case "carbon": {
      const res = await getCarbonOffset();
      if (res) {
        const { data } = res;
        await say(
          `${TREE_EMOJI} ${process.env.COMPANY_NAME} have offset ${
            Math.ceil(data.total_carbon_offset * 100) / 100
          }t of carbon ${TREE_EMOJI}`,
        );
      }
      break;
    }
    case "forest": {
      const res = await getForest();
      if (res) {
        const { forest_url, quantity_gifted, quantity_planted } = res;
        await say(
          `${TREE_EMOJI} ${process.env.COMPANY_NAME} have planted ${
            quantity_planted + quantity_gifted
          } trees. View our virtual forest here: ${forest_url} ${TREE_EMOJI}`,
        );
      }
      break;
    }
    case "credits": {
      const credits = await getCredits();
      if (credits) {
        await say(
          `${TREE_EMOJI} ${process.env.COMPANY_NAME} have ${credits} credits left to plant trees ${TREE_EMOJI}`,
        );
      }
      break;
    }
    default: {
      await say(
        "You're barking up the wrong tree with that command! Try `/treeumph carbon` to view total carbon offset or `/treeumph forest` to view the virtual forest",
      );
    }
  }
});

app.message(async ({ message, say }) => {
  const botMessage = message as BotMessageEvent;
  const bobAttachment =
    botMessage?.attachments?.filter(
      (attachment) => attachment.footer === "bob Slack Integration",
    ) || [];
  if (botMessage.user === HR_BOT_USER_ID && bobAttachment.length) {
    if (bobAttachment[0]?.pretext?.startsWith("New Shoutout from")) {
      const credits = await getCredits();
      if (credits) {
        const res = await plantTree();
        if (res) {
          await app.client.reactions.add({
            token: process.env.SLACK_BOT_TOKEN,
            name: TREE_EMOJI_NAME,
            channel: message.channel,
            timestamp: message.ts,
          });
        }
      } else {
        // @TODO: have better UX for when we hit the monthly budget
        await app.client.reactions.add({
          token: process.env.SLACK_BOT_TOKEN,
          name: "money_with_wings",
          channel: message.channel,
          timestamp: message.ts,
        });
      }
    }
  }
});

const start = async (): Promise<void> => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
};

start().catch((error) => {
  console.log(`error starting app: ${error}`);
});
