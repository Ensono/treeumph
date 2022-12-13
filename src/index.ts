import dotenv from "dotenv";
import { App, BotMessageEvent } from "@slack/bolt";
import { plantTree, getCarbonOffset, getForest } from "./api/more-trees";
dotenv.config();

const PORT: number =
  process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;

// This is currently set to the id for the "CW Treeumph" bot in slack
// @TODO: Update this to be the id for the BOB HR Bot
const BOT_USER_ID = process.env.SLACK_BOT_ID;

const tree = ":deciduous_tree:";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: isNaN(PORT) ? 3000 : PORT,
});

app.command("/treeumph", async ({ command, ack, say }) => {
  switch (command.text) {
    case "carbon": {
      const res = await getCarbonOffset();
      if (res) {
        const { data } = res;
        await say(
          `${tree} ${process.env.COMPANY_NAME} have offset ${
            Math.ceil(data.total_carbon_offset * 100) / 100
          }t of carbon ${tree}`,
        );
      }
      break;
    }
    case "forest": {
      const res = await getForest();
      if (res) {
        const { forest_url, quantity_gifted, quantity_planted } = res;
        await say(
          `${tree} ${process.env.COMPANY_NAME} have planted ${
            quantity_planted + quantity_gifted
          } trees. View our virtual forest here: ${forest_url} ${tree}`,
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

app.message("New shoutout from", async ({ message, say }) => {
  const botMessage = message as BotMessageEvent;
  if (botMessage.user === BOT_USER_ID) {
    const res = await plantTree();
    if (res) {
      await app.client.reactions.add({
        token: process.env.SLACK_BOT_TOKEN,
        name: "deciduous_tree",
        channel: message.channel,
        timestamp: message.ts,
      });
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
