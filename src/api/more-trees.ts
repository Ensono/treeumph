import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import logger from "../utils/logger";

const moreTreesApi = axios.create({
  baseURL: "https://api.moretrees.eco/v1/basic",
  headers: {
    Authorization: process.env.MORE_TREES_API_KEY,
  },
});

type ApiResponse<T> = Promise<T | undefined>;

interface AccountInfo {
  credits: number;
  forest_name: string;
  saved_co2: number;
  forest_url: string;
  quantity_planted: number;
  quantity_gifted: number;
  quantity_received: number;
}

type Forest = Pick<
  AccountInfo,
  "quantity_gifted" | "quantity_planted" | "forest_url"
>;

interface CarbonOffset {
  total_carbon_offset: number;
}

interface PlantTree {
  response: string;
}

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

export const getCarbonOffset = async (): Promise<CarbonOffset> => {
  const response = await moreTreesApi.get("/carbonOffset");
  console.log(response);
  return response.data;
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
