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

export const getInfo = async (): ApiResponse<AccountInfo> => {
  try {
    const response = await moreTreesApi.get("/getInfo");
    return response.data;
  } catch (err) {
    logger.error(`/getInfo: ${err.message}`);
  }
};

export const getForest = async (): ApiResponse<Forest> => {
  const res = await getInfo();
  return res;
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
