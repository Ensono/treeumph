import axios from "axios";

const moreTreesApi = axios.create({
  baseURL: "https://api.moretrees.eco/v1/basic",
  headers: {
    Authorization: process.env.MORE_TREES_API_KEY,
  },
});

interface Forest {
  forest_url: string;
  quantity_planted: number;
  quantity_gifted: number;
}

interface CarbonOffset {
  total_carbon_offset: number;
}

interface PlantTree {
  response: string;
}

export const getForest = async (): Promise<Forest> => {
  const response = await moreTreesApi.get("/trees");
  console.log(response);
  return response.data;
};

export const getCarbonOffset = async (): Promise<CarbonOffset> => {
  const response = await moreTreesApi.get("/carbonOffset");
  console.log(response);
  return response.data;
};

export const plantTree = async (): Promise<PlantTree> => {
  const response = await moreTreesApi.post("/planttree", {
    tree_slug: "any_tree",
    request_type: 1,
    quantity: 1,
  });
  console.log(response);
  return response.data;
};
