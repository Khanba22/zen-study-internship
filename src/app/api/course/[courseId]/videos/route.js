import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
    const { courseId } = await params; // Extract courseId from URL params

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is missing" }, { status: 400 });
    }

    const formData = await req.formData();

    // Filter out video files
    const videoFiles = [];
    for (const key of formData.keys()) {
      if (key.startsWith("video")) {
        videoFiles.push(formData.get(key));
      }
    }

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 400 });
    }

    // Upload files to S3 inside `course/{courseId}/` folder
    const uploadPromises = videoFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `course/${courseId}/${Date.now()}-${file.name}`, // Dynamic course ID
        Body: buffer,
        ContentType: file.type,
      };

      const response = await s3.send(new PutObjectCommand(uploadParams));
      console.log("S3 Upload Response:", response);
    });

    await Promise.all(uploadPromises);

    return NextResponse.json({ message: "Videos uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
