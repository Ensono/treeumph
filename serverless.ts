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
      MORE_TREES_API_KEY: `${process.env.MORE_TREES_API_KEY}`,
      IAM_ACCESS_KEY_ID: `${process.env.IAM_ACCESS_KEY_ID}`,
      IAM_ACCESS_SECRET: `${process.env.IAM_ACCESS_SECRET}`,
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
  },
  functions: { slackbot },
  package: { individually: true },
  resources: {
    Resources: {
      treeumphBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "treeumph-bucket-store",
        },
      },
      treeumphBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: {
            Ref: "treeumphBucket",
          },
          PolicyDocument: {
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:s3:::",
                      {
                        Ref: "treeumphBucket",
                      },
                      "/*",
                    ],
                  ],
                },
              },
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:PutObject",
                Resource: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:s3:::",
                      {
                        Ref: "treeumphBucket",
                      },
                      "/*",
                    ],
                  ],
                },
              },
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:DeleteObject",
                Resource: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:s3:::",
                      {
                        Ref: "treeumphBucket",
                      },
                      "/*",
                    ],
                  ],
                },
              },
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:ListBucket",
                Resource: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:s3:::",
                      {
                        Ref: "treeumphBucket",
                      },
                      "",
                    ],
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
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
