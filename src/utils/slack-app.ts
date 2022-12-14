import dotenv from "dotenv";
dotenv.config();
import { App } from "@slack/bolt";

const PORT: number =
  process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: isNaN(PORT) ? 3000 : PORT,
});

export default app;
