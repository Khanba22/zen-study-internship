import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// ✅ Create a course folder
export async function POST(req) {
  try {
    const { courseName } = await req.json();
    if (!courseName) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    const folderKey = `course/${courseName}/`;
    const createParams = {
      Bucket: BUCKET_NAME,
      Key: folderKey,
      Body: "",
    };

    await s3.send(new PutObjectCommand(createParams));

    return NextResponse.json({ message: "Course folder created successfully", folderKey }, { status: 200 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Course creation failed" }, { status: 500 });
  }
}

// ✅ List all courses
export async function GET() {
  try {
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: "course/",
      Delimiter: "/",
    };

    const data = await s3.send(new ListObjectsV2Command(listParams));
    const courses = data.CommonPrefixes?.map((prefix) => prefix.Prefix.replace("course/", "").replace("/", "")) || [];

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("List courses error:", error);
    return NextResponse.json({ error: "Failed to retrieve courses" }, { status: 500 });
  }
}

// ✅ Update (rename) a course
export async function PUT(req) {
  try {
    const { oldCourseName, newCourseName } = await req.json();
    if (!oldCourseName || !newCourseName) {
      return NextResponse.json({ error: "Both old and new course names are required" }, { status: 400 });
    }

    // S3 doesn't allow direct renaming, requires copy+delete
    return NextResponse.json({ message: "S3 does not support direct renaming. Implement copy + delete manually." }, { status: 400 });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Course update failed" }, { status: 500 });
  }
}

// ✅ Delete a course folder
export async function DELETE(req) {
  try {
    const { courseName } = await req.json();
    if (!courseName) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    const folderKey = `course/${courseName}/`;
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: folderKey,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    return NextResponse.json({ message: "Course folder deleted successfully", folderKey }, { status: 200 });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Course deletion failed" }, { status: 500 });
  }
}