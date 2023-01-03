import dotenv from "dotenv";
dotenv.config();

export const COMPANY_NAME = "Ensono Digital";
// This is currently set to the user id for the "CW Treeumph" bot in slack
// @TODO: Update this to be the user id for the BOB HR Bot
export const HR_BOT_USER_ID = "U04FFG30QUV";
export const MONTHLY_TREE_BUDGET = 30;
export const S3_BUCKET_NAME = "ensono-treeumph-bucket-store";
export const TREE_EMOJI_NAME = "deciduous_tree";
export const TREE_EMOJI = `:${TREE_EMOJI_NAME}:`;
