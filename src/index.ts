import dotenv from "dotenv";
import { App, BotMessageEvent } from "@slack/bolt";
import { plantTree } from "./api/more-trees";
dotenv.config();

const PORT: number =
  process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;

// This is currently set to the id for the "CW Treeumph" bot in slack
// @TODO: Update this to be the id for the BOB HR Bot
const BOT_USER_ID = "U035JJL8F9S";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: isNaN(PORT) ? 3000 : PORT,
});

app.message("ping", async ({ message, say }) => {
  const botMessage = message as BotMessageEvent;
  if (botMessage.user !== undefined) {
    await say(`pong <@${botMessage.user}>!`);
  }
});

app.message("New shoutout from", async ({ message, say }) => {
  const botMessage = message as BotMessageEvent;
  if (botMessage.user === BOT_USER_ID) {
    const res = await plantTree();
    if (res instanceof Error) return;

    await app.client.reactions.add({
      token: process.env.SLACK_BOT_TOKEN,
      name: "deciduous_tree",
      channel: message.channel,
      timestamp: message.ts,
    });
  }
});

const start = async (): Promise<void> => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
};

start().catch((error) => {
  console.log("error: ", error);
});
