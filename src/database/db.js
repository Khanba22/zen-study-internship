// Import required modules
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure the AWS SDK v3 client
const client = new DynamoDBClient({
  region: "ap-south-1", // Replace with your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create a DynamoDB DocumentClient for easier operations
const dynamoDB = DynamoDBDocumentClient.from(client);

export { dynamoDB };
