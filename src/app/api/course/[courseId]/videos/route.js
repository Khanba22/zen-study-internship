import { dynamoDB } from "@/database/db";
import { authenticate, authorize } from "@/app/utils/auth";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: "ap-south-1", // Replace with your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(req, { params }) {
  const { courseId } = params;

  try {
    const getParams = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
    };

    const result = await dynamoDB.get(getParams).promise();
    const course = result.Item;

    if (!course) {
      return new Response(JSON.stringify({ message: "Course not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(course.videos), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req, { params }) {
  const user = await authenticate(req);
  // if (!user || !authorize(user, ["admin"])) {
  //   return new Response(JSON.stringify({ message: "Access denied" }), {
  //     status: 403,
  //   });
  // }

  const { courseId } = params;

  try {
    const { title, description, duration } = await req.json();

    // Generate a unique video ID
    const videoId = Date.now().toString();

    // Create a pre-signed URL for video upload
    const videoKey = `videos/${courseId}/${videoId}.mp4`;
    const putObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: videoKey,
      ContentType: "video/mp4",
    };
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(putObjectParams),
      { expiresIn: 3600 } // URL expires in 1 hour
    );

    // Create a pre-signed URL for video access
    const getObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: videoKey,
    };
    const accessUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 604800 } // URL expires in 7 days
    );

    // Check if course exists
    const getParams = {
      TableName: "Courses",
      Key: { courseId },
    };
    const { Item: course } = await dynamoDB.send(new GetCommand(getParams));

    // Create course if it doesn't exist
    if (!course) {
      const createParams = {
        TableName: "Courses",
        Item: {
          courseId,
          courseTitle: "New Course",
          courseDescription: "",
          instructor: "Unknown",
          videos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      await dynamoDB.send(new PutCommand(createParams));
    }

    // Add video metadata to DynamoDB
    const updateParams = {
      TableName: "Courses",
      Key: { courseId },
      UpdateExpression:
        "SET videos = list_append(if_not_exists(videos, :empty_list), :newVideo)",
      ExpressionAttributeValues: {
        ":newVideo": [
          {
            videoId,
            title,
            description,
            duration,
            videoKey, // Store the S3 key instead of URL
            createdAt: new Date().toISOString(),
          },
        ],
        ":empty_list": [],
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes: updatedCourse } = await dynamoDB.send(
      new UpdateCommand(updateParams)
    );

    return new Response(
      JSON.stringify({
        ...updatedCourse,
        uploadUrl,
        accessUrl,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error adding video:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}

export async function DELETE(req, { params }) {
  const user = await authenticate(req);
  if (!user || !authorize(user, ["admin"])) {
    return new Response(JSON.stringify({ message: "Access denied" }), {
      status: 403,
    });
  }

  const { courseId, videoId } = params;

  try {
    const getParams = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
    };

    const result = await dynamoDB.get(getParams).promise();
    const course = result.Item;

    if (!course) {
      return new Response(JSON.stringify({ message: "Course not found" }), {
        status: 404,
      });
    }

    course.videos = course.videos.filter((video) => video.videoId !== videoId);

    const updateParams = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
      UpdateExpression: "SET videos = :newVideos",
      ExpressionAttributeValues: {
        ":newVideos": course.videos,
      },
      ReturnValues: "ALL_NEW",
    };

    const updatedCourse = await dynamoDB.update(updateParams).promise();

    return new Response(JSON.stringify(updatedCourse.Attributes), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
