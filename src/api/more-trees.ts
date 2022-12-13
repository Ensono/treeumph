import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import logger from "../utils/logger";
import type { AccountInfo, Forest, CarbonOffset, ApiResponse, PlantTree } from "./more-trees.types";

const moreTreesApi = axios.create({
  baseURL: "https://api.moretrees.eco/v1/basic",
  headers: {
    Authorization: process.env.MORE_TREES_API_KEY,
  },
});

export const getInfo = async (): Promise<AccountInfo> => {
  const response = await moreTreesApi.get("/getInfo");
  console.log(response);
  return response.data;
};

export const getForest = async (): Promise<Forest> => {
  const response = await moreTreesApi.get("/getForest");
  console.log(response);
  return response.data;
};

export const getCarbonOffset = async (): ApiResponse<CarbonOffset> => {
  try {
    const response = await moreTreesApi.get("/carbonOffset");
    return response.data;
  } catch (err) {
    logger.error(`/carbonOffset: ${err.message}`);
  }
};

export const plantTree = async (): ApiResponse<PlantTree> => {
  try {
    const response = await moreTreesApi.post("/planttree", {
      type_slug: "any_tree",
      request_type: 1,
      quantity: 1,
    });
    return response.data;
  } catch (err) {
    logger.error(`/planttree: ${err.message}`);
  }
};
