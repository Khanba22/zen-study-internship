import AWS from "aws-sdk";

// Configure the AWS SDK
AWS.config.update({
  region: "ap-south-1", // Replace with your region
  accessKeyId: "AKIARHQBNV67Y6ZSJBHW", // Replace with your access key ID
  secretAccessKey: "lTej5+X3At06+/77mWjEhf8KGYymZx14VOXPM5Ub", // Replace with your secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const connectToDynamoDB = async () => {
  try {
    // Test the connection by listing tables
    const tables = await dynamoDB.listTables().promise();
    console.log("Connected to DynamoDB. Tables:", tables.TableNames);
  } catch (error) {
    console.error("Error connecting to DynamoDB: ", error);
  }
};

export { dynamoDB, connectToDynamoDB };
