import dotenv from "dotenv";
dotenv.config();

// This is currently set to the user id for the "CW Treeumph" bot in slack
// @TODO: Update this to be the user id for the BOB HR Bot
export const BOT_USER_ID = process.env.SLACK_BOT_USER_ID;

export const TREE_EMOJI_NAME = "deciduous_tree";
export const TREE_EMOJI = `:${TREE_EMOJI_NAME}:`;
export const MONTHLY_TREE_BUDGET = 30;
