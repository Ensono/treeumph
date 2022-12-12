import dotenv from "dotenv";
import { App, BotMessageEvent } from "@slack/bolt";
dotenv.config();

const PORT: number =
  process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;

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

const start = async (): Promise<void> => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
};

start().catch((error) => {
  console.log("error: ", error);
});
