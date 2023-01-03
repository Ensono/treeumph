export interface IKudosCount {
  count: number;
  date: string;
  slack_ts_reference: string;
}

export const uploadKudosObjectToS3Bucket = async (
  objectKey: string,
  objectData: IKudosCount,
  s3Bucket: AWS.S3,
  bucketName: string,
) => {
  try {
    await s3Bucket
      .putObject({
        Bucket: bucketName,
        Key: objectKey,
        Body: JSON.stringify(objectData),
        ContentType: "application/json; charset=utf-8",
      })
      .promise();
  } catch (error) {
    throw new Error(`Could not upload file to S3: ${error.message}`);
  }
};

export const getObjectFromS3Bucket = async (
  objectKey: string,
  s3Bucket: AWS.S3,
  bucketName: string,
) => {
  try {
    const data = await s3Bucket
      .getObject({
        Bucket: bucketName,
        Key: objectKey,
      })
      .promise();
    return data?.Body?.toString("utf-8");
  } catch (error) {
    if (error.message)
      throw new Error(`Could not retrieve file from S3: ${error.message}`);
  }
};

export const listObjectsFromS3Bucket = async (
  s3Bucket: AWS.S3,
  bucketName: string,
) => {
  try {
    const objects = await s3Bucket
      .listObjectsV2({ Bucket: bucketName })
      .promise();
    return objects?.Contents || [];
  } catch (error) {
    throw new Error(`Could not retrieve objects from S3: ${error.message}`);
  }
};
