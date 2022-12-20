import { BotMessageEvent } from "@slack/bolt";
import { app, awsLambdaReceiver } from "../../utils/slack-app";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
} from "aws-lambda";
import { getCredits } from "../../api/more-trees";
import { HR_BOT_USER_ID } from "src/utils/constants";
import {
  carbonAction,
  creditsAction,
  defaultAction,
  forestAction,
  plantTreeAction,
  treeLimitAction,
} from "src/utils/actions";

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
      const credits = await getCredits();
      if (credits) {
        await plantTreeAction(message);
      } else {
        await treeLimitAction(say);
      }
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
