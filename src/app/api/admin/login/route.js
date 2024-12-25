import connectToMongoDB from "@/database/db";
import User from "@/database/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToMongoDB();
    const { username, password } = await req.json();
    const admin = await User.findOne({ username });
    console.log(admin);
    if (!admin || !admin.roles.includes("admin")) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }



    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return new NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }
    const token = 1234567890;
    // const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });

    return NextResponse.json({ token, user: admin });
  } catch (err) {
    console.error("Admin login failed:", err);
    return NextResponse.json(
      { message: "Internal server error" }
    );
  }
}
