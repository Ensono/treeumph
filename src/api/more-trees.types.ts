export type ApiResponse<T> = Promise<T | undefined>;

export interface AccountInfo {
  credits: number;
  forest_name: string;
  saved_co2: number;
  forest_url: string;
  quantity_planted: number;
  quantity_gifted: number;
  quantity_received: number;
}

export type Forest = Pick<
  AccountInfo,
  "quantity_gifted" | "quantity_planted" | "forest_url"
>;

export interface CarbonOffset {
  data: {
    total_carbon_offset: number;
  }
}

export interface TreeCertificate {
  name: string;
  email: string;
  certificateUrl: string;
  certificateID: string;
}

export interface PlantTree {
  response: string;
  certificates: TreeCertificate[];
}
