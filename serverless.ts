import * as dotenv from "dotenv";
import type { AWS } from "@serverless/typescript";
dotenv.config();

import { slackbot } from "@functions/slackbot";

const config: AWS = {
  service: "treeumph",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-offline-watcher",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      SLACK_SIGNING_SECRET: `${process.env.SLACK_SIGNING_SECRET}`,
      SLACK_BOT_TOKEN: `${process.env.SLACK_BOT_TOKEN}`,
      HR_BOT_USER_ID: `${process.env.HR_BOT_USER_ID}`,
      COMPANY_NAME: `${process.env.COMPANY_NAME}`,
      MORE_TREES_API_KEY: `${process.env.MORE_TREES_API_KEY}`,
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
  },
  functions: { slackbot },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      target: "node18",
      exclude: ["aws-sdk"],
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    "serverless-offline-watcher": [
      {
        path: "src",
        command: `echo "changes detected in src..."`,
      },
    ],
  },
};

module.exports = config;
