import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req, { params }) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is missing" }, { status: 400 });
    }

    const formData = await req.formData();
    const videoFiles = [];
    for (const key of formData.keys()) {
      if (key.startsWith("video")) {
        videoFiles.push(formData.get(key));
      }
    }

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 400 });
    }

    const uploadPromises = videoFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileKey = `course/${courseId}/${Date.now()}-${file.name}`;
      
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      return fileKey;
    });

    const uploadedKeys = await Promise.all(uploadPromises);

    return NextResponse.json({ message: "Videos uploaded successfully", uploadedKeys }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
