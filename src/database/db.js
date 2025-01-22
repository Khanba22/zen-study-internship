// Import required modules
import AWS from "aws-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure the AWS SDK
AWS.config.update({
  region: "ap-south-1", // Replace with your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variables without NEXT_PUBLIC prefix
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use private environment variables
});
console.log(process.env.AWS_ACCESS_KEY_ID);
// Create a DynamoDB DocumentClient instance
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to test the DynamoDB connection
const connectToDynamoDB = async () => {
  try {
    // List DynamoDB tables to confirm connection
    const tables = await dynamoDB.listTables().promise();
    console.log("Connected to DynamoDB. Tables:", tables.TableNames);
  } catch (error) {
    console.error("Error connecting to DynamoDB:", error);
  }
};

export { dynamoDB, connectToDynamoDB };
