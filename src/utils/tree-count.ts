import { SearchMessagesArguments } from "@slack/web-api";
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import app from "./slack-app";
import { SLACK_BOT_USER_ID, TREE_EMOJI_NAME } from "./constants";
import logger from "./logger";
import { Match } from "@slack/web-api/dist/response/SearchMessagesResponse";

export const getAllMessages = async (query: string) => {
  let currentPage = 1;

  const searchConfig: SearchMessagesArguments = {
    query,
    token: process.env.SLACK_USER_TOKEN,
    sort: "timestamp",
    sort_dir: "asc",
  };

  const allMessages = [];

  // Get the first round of messages and find out how many pages of messages we have
  const initialQuery = await app.client.search.messages({
    ...searchConfig,
    page: currentPage,
  });

  // Add initial messages to the array
  const { messages } = initialQuery;
  if (messages?.matches?.length) {
    allMessages.push(...messages.matches);
  }

  // If we have more than one page of messages, loop through the rest of the pages and grab the messages
  if (messages?.paging?.pages) {
    while (messages.paging.pages > currentPage) {
      currentPage += 1;

      const res = await app.client.search.messages({
        ...searchConfig,
        page: currentPage,
      });

      if (res.messages?.matches?.length) {
        allMessages.push(...res.messages.matches);
      }
    }
  }

  return allMessages;
};


// Get messages where the bot has reacted with a 🌳 emoji
const getReaction = async (message: Match) => {
  if (message.ts && message.channel) {
    const reaction = await app.client.reactions.get({
      token: process.env.SLACK_BOT_TOKEN,
      channel: message.channel.id,
      timestamp: message.ts,
    });

    if (reaction.message?.reactions?.length && SLACK_BOT_USER_ID) {
      const { users, name } = reaction.message.reactions[0];

      if (users?.includes(SLACK_BOT_USER_ID) && name === TREE_EMOJI_NAME) {
        return {
          ...message,
          reactions: reaction.message.reactions,
        };
      }
    }
  }
}

/**
 * It should be noted that this function is not guaranteed to give us an accurate count of trees planted.
 * The more-trees api only provides us with the total count of trees planted and not per month.
 * So this function will give us a rough estimate of how many trees have been planted in a current month
 * and we can then limit tree planting based on the set budget
 */
export const getEstimatedMonthlyTreeCount = async (): Promise<
  number
> => {
  try {
    const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");
    const channel = "random";
    const query = `New shoutout from in:#${channel} after:${startDate} before:${endDate}`;
    const allMessages = await getAllMessages(query);

    // Get all messages that have a 🌳 reaction from the bot
    const messagesWithReactions = [];
    if (allMessages.length) {
      for (const message of allMessages) {
        const reaction = await getReaction(message);
        if (reaction) {
          messagesWithReactions.push(reaction);
        }
      }
    }

    return messagesWithReactions.length;
  } catch (error) {
    logger.error(`Error getting estimated monthly tree count: ${error}`);
  }

  return 0;
};
