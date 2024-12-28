import { dynamoDB } from "@/database/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Scan the table to find the user by email
    const params = {
      TableName: "Users", // Replace with your DynamoDB table name
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const result = await dynamoDB.scan(params).promise();
    const user = result.Items[0];

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
      });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.id, roles: user.roles }, SECRET, {
      expiresIn: "1h",
    });

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
