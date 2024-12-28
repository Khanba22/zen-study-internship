import { dynamoDB } from "@/database/db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // Import UUID library to generate unique IDs
export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
      TableName: "Users", // Replace with your DynamoDB table name
      Item: {
        id: uuidv4(), // Generate a unique ID for the user
        username,
        email,
        password: hashedPassword,
        roles: "admin",
      },
    };

    await dynamoDB.put(params).promise();

    return new Response(
      JSON.stringify({ message: "User created successfully" }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
