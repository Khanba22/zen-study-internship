import connectToMongoDB from "@/database/db";
import User from "@/database/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectToMongoDB();
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles:['admin', 'user'],
    });
    await newUser.save();

    return NextResponse.json(
      { message: "User created" },
      {
        status: 201,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      {
        status: 400,
      }
    );
  }
};
// Compare this snippet from src/app/api/auth/login/route.js:
// import User from '@/database/models/User';
// import bcrypt from 'bcrypt';
