import { handlerPath } from "@libs/handler-resolver";

export const slackbot = {
  handler: `${handlerPath(__dirname)}/handler.slackbot`,
  events: [
    {
      http: {
        method: "post",
        path: "slackbot/events",
      },
    },
  ],
};
