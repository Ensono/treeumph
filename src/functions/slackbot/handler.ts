import { BotMessageEvent, KnownEventFromType } from "@slack/bolt";
import dotenv from "dotenv";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
} from "aws-lambda";
import AWS from "aws-sdk";
import { HR_BOT_USER_ID, S3_BUCKET_NAME } from "src/utils/constants";
import {
  carbonAction,
  creditsAction,
  defaultAction,
  forestAction,
  kudosMessageAction,
} from "src/utils/actions";
import { app, awsLambdaReceiver } from "src/utils/slack-app";

dotenv.config();

app.command("/treeumph", async ({ command, ack, say }) => {
  await ack();
  switch (command.text) {
    case "carbon": {
      await carbonAction(say);
      break;
    }
    case "forest": {
      await forestAction(say);
      break;
    }
    case "credits": {
      await creditsAction(say);
      break;
    }
    default: {
      await defaultAction(say);
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
      const s3 = new AWS.S3({
        accessKeyId: process.env.IAM_ACCESS_KEY_ID,
        secretAccessKey: process.env.IAM_ACCESS_SECRET,
      });
      await kudosMessageAction(s3, S3_BUCKET_NAME, message, say);
    }
  }
});

export const slackbot = async (
  event: APIGatewayProxyEvent,
  context: string,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
