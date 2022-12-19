import { App, AwsLambdaReceiver, BotMessageEvent } from "@slack/bolt";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
} from "aws-lambda";
import { plantTree, getCarbonOffset, getForest } from "../../api/more-trees";

// This is currently set to the user id for the "CW Treeumph" bot in slack
// @TODO: Update this to be the user id for the BOB HR Bot
const BOT_USER_ID = process.env.SLACK_BOT_USER_ID;

const tree = ":deciduous_tree:";

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
});

const app = new App({
  token: `${process.env.SLACK_BOT_TOKEN}`,
  receiver: awsLambdaReceiver,
});

app.command("/treeumph", async ({ command, ack, say }) => {
  await ack();
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

export const slackbot = async (
  event: APIGatewayProxyEvent,
  context: string,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
