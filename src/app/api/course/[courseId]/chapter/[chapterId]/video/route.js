import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  UpdateItemCommand, 
  DeleteItemCommand, 
  QueryCommand,
  ScanCommand 
} from "@aws-sdk/client-dynamodb";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const VIDEOS_TABLE_NAME = "Videos";
const CHAPTERS_TABLE_NAME = "Chapters";
const COURSES_TABLE_NAME = "Courses";

export const config = {
  api: {
    bodyParser: false,
  },
};

// CREATE - Upload video(s) to S3 and add to Videos table
export async function POST(req, { params }) {
  try {
    const { courseId, chapterId } = params;
    
    if (!courseId || !chapterId) {
      return NextResponse.json({ error: "Course ID and Chapter ID are required" }, { status: 400 });
    }

    // Verify course exists
    const courseParams = {
      TableName: COURSES_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      }
    };
    const { Item: courseItem } = await dynamoDB.send(new GetItemCommand(courseParams));
    if (!courseItem) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify chapter exists and belongs to the course
    const chapterParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Key: {
        chapterId: { S: chapterId }
      }
    };
    const { Item: chapterItem } = await dynamoDB.send(new GetItemCommand(chapterParams));
    if (!chapterItem) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
    if (chapterItem.courseId.S !== courseId) {
      return NextResponse.json({ error: "Chapter does not belong to this course" }, { status: 400 });
    }

    const formData = await req.formData();
    const videoFiles = [];
    const videoTitles = {};
    const videoDescriptions = {};
    const videoDurations = {};
    const videoOrders = {};

    // Extract files and metadata
    for (const key of formData.keys()) {
      if (key.startsWith("video")) {
        const videoIndex = key.replace("video", "");
        videoFiles.push({
          index: videoIndex,
          file: formData.get(key)
        });
      } else if (key.startsWith("title")) {
        const titleIndex = key.replace("title", "");
        videoTitles[titleIndex] = formData.get(key);
      } else if (key.startsWith("description")) {
        const descIndex = key.replace("description", "");
        videoDescriptions[descIndex] = formData.get(key);
      } else if (key.startsWith("duration")) {
        const durationIndex = key.replace("duration", "");
        videoDurations[durationIndex] = formData.get(key);
      } else if (key.startsWith("order")) {
        const orderIndex = key.replace("order", "");
        videoOrders[orderIndex] = formData.get(key);
      }
    }

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 400 });
    }

    const uploadResults = await Promise.all(videoFiles.map(async ({ index, file }) => {
      // Generate unique ID for the video
      const videoId = randomUUID();
      
      // Get file data
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Extract file information
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const fileKey = `course/${courseId}/${chapterId}/${videoId}.${fileExtension}`;
      
      // Upload to S3
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      
      // Get video metadata
      const title = videoTitles[index] || fileName;
      const description = videoDescriptions[index] || "";
      const duration = videoDurations[index] || "0";
      const order = videoOrders[index] || "0";
      
      // Store in DynamoDB
      const videoParams = {
        TableName: VIDEOS_TABLE_NAME,
        Item: {
          videoId: { S: videoId },
          chapterId: { S: chapterId },
          courseId: { S: courseId },
          videoTitle: { S: title },
          description: { S: description },
          fileName: { S: fileName },
          fileKey: { S: fileKey },
          fileType: { S: file.type },
          fileSize: { N: buffer.length.toString() },
          duration: { N: duration.toString() },
          order: { N: order.toString() },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
          isActive: { BOOL: true }
        }
      };
      
      await dynamoDB.send(new PutItemCommand(videoParams));
      
      return {
        videoId,
        fileKey,
        title,
        description,
        duration: parseInt(duration),
        order: parseInt(order)
      };
    }));

    return NextResponse.json({ 
      message: "Videos uploaded successfully", 
      courseId,
      courseName: courseItem.courseName.S,
      chapterId,
      chapterName: chapterItem.chapterName.S,
      videos: uploadResults 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

// READ - Get all videos for a chapter or a specific video
export async function GET(req, { params }) {
  try {
    const { courseId, chapterId } = params;
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    
    if (!courseId || !chapterId) {
      return NextResponse.json({ error: "Course ID and Chapter ID are required" }, { status: 400 });
    }

    // Get a specific video
    if (videoId) {
      const videoParams = {
        TableName: VIDEOS_TABLE_NAME,
        Key: {
          videoId: { S: videoId }
        }
      };
      
      const { Item } = await dynamoDB.send(new GetItemCommand(videoParams));
      
      if (!Item) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      
      // Verify the video belongs to the requested chapter and course
      if (Item.chapterId.S !== chapterId || Item.courseId.S !== courseId) {
        return NextResponse.json({ error: "Video does not belong to this chapter/course" }, { status: 400 });
      }
      
      // Generate a presigned URL for streaming (valid for 1 hour)
      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: Item.fileKey.S
      };
      
      const signedUrl = await getSignedUrl(s3, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });
      
      // Format the response
      const video = {
        videoId: Item.videoId.S,
        courseId: Item.courseId.S,
        chapterId: Item.chapterId.S,
        videoTitle: Item.videoTitle.S,
        description: Item.description.S,
        fileName: Item.fileName.S,
        fileType: Item.fileType.S,
        fileSize: parseInt(Item.fileSize.N),
        duration: parseInt(Item.duration.N),
        order: parseInt(Item.order.N),
        createdAt: Item.createdAt.S,
        updatedAt: Item.updatedAt.S,
        isActive: Item.isActive.BOOL,
        streamUrl: signedUrl
      };
      
      return NextResponse.json({ video }, { status: 200 });
    } 
    // Get all videos for a chapter
    else {
      // Use query with GSI if available
      let videos;
      try {
        const queryParams = {
          TableName: VIDEOS_TABLE_NAME,
          IndexName: "chapterId-index",
          KeyConditionExpression: "chapterId = :chapterId",
          ExpressionAttributeValues: {
            ":chapterId": { S: chapterId }
          }
        };
        
        const { Items } = await dynamoDB.send(new QueryCommand(queryParams));
        videos = Items;
      } catch (error) {
        // Fall back to scan if GSI doesn't exist
        const scanParams = {
          TableName: VIDEOS_TABLE_NAME,
          FilterExpression: "chapterId = :chapterId AND courseId = :courseId",
          ExpressionAttributeValues: {
            ":chapterId": { S: chapterId },
            ":courseId": { S: courseId }
          }
        };
        
        const { Items } = await dynamoDB.send(new ScanCommand(scanParams));
        videos = Items;
      }
      
      // Transform and sort videos
      const formattedVideos = videos.map(item => ({
        videoId: item.videoId.S,
        courseId: item.courseId.S,
        chapterId: item.chapterId.S,
        videoTitle: item.videoTitle.S,
        description: item.description.S,
        fileName: item.fileName.S,
        fileType: item.fileType.S,
        fileSize: parseInt(item.fileSize.N),
        duration: parseInt(item.duration.N),
        order: parseInt(item.order.N),
        createdAt: item.createdAt.S,
        updatedAt: item.updatedAt.S,
        isActive: item.isActive.BOOL
      }));
      
      // Sort by order field
      formattedVideos.sort((a, b) => a.order - b.order);
      
      return NextResponse.json({ videos: formattedVideos }, { status: 200 });
    }
  } catch (error) {
    console.error("Get video(s) error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve video(s)" }, { status: 500 });
  }
}

// UPDATE - Update video metadata
export async function PUT(req, { params }) {
  try {
    const { courseId, chapterId } = params;
    const { videoId, videoTitle, description, duration, order, isActive } = await req.json();
    
    if (!videoId || !courseId || !chapterId) {
      return NextResponse.json({ error: "Video ID, Course ID, and Chapter ID are required" }, { status: 400 });
    }
    
    // Check if video exists and belongs to the correct chapter/course
    const checkParams = {
      TableName: VIDEOS_TABLE_NAME,
      Key: {
        videoId: { S: videoId }
      }
    };
    
    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    if (Item.chapterId.S !== chapterId || Item.courseId.S !== courseId) {
      return NextResponse.json({ error: "Video does not belong to this chapter/course" }, { status: 400 });
    }
    
    // Build update expression and attribute values
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": { S: new Date().toISOString() }
    };
    
    if (videoTitle) {
      updateExpression += ", videoTitle = :videoTitle";
      expressionAttributeValues[":videoTitle"] = { S: videoTitle };
    }
    
    if (description !== undefined) {
      updateExpression += ", description = :description";
      expressionAttributeValues[":description"] = { S: description };
    }
    
    if (duration !== undefined) {
      updateExpression += ", duration = :duration";
      expressionAttributeValues[":duration"] = { N: duration.toString() };
    }
    
    if (order !== undefined) {
      updateExpression += ", #order = :order";
      expressionAttributeValues[":order"] = { N: order.toString() };
    }
    
    if (isActive !== undefined) {
      updateExpression += ", isActive = :isActive";
      expressionAttributeValues[":isActive"] = { BOOL: isActive };
    }
    
    // Update video in DynamoDB
    const updateParams = {
      TableName: VIDEOS_TABLE_NAME,
      Key: {
        videoId: { S: videoId }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: order !== undefined ? { "#order": "order" } : undefined,
      ReturnValues: "ALL_NEW"
    };
    
    const { Attributes } = await dynamoDB.send(new UpdateItemCommand(updateParams));
    
    // Format the response
    const updatedVideo = {
      videoId: Attributes.videoId.S,
      courseId: Attributes.courseId.S,
      chapterId: Attributes.chapterId.S,
      videoTitle: Attributes.videoTitle.S,
      description: Attributes.description.S,
      fileName: Attributes.fileName.S,
      fileType: Attributes.fileType.S,
      fileSize: parseInt(Attributes.fileSize.N),
      duration: parseInt(Attributes.duration.N),
      order: parseInt(Attributes.order.N),
      createdAt: Attributes.createdAt.S,
      updatedAt: Attributes.updatedAt.S,
      isActive: Attributes.isActive.BOOL
    };
    
    return NextResponse.json(
      { message: "Video updated successfully", video: updatedVideo },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update video error:", error);
    return NextResponse.json({ error: error.message || "Video update failed" }, { status: 500 });
  }
}

// DELETE - Delete a video
export async function DELETE(req, { params }) {
  try {
    const { courseId, chapterId } = params;
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    
    if (!videoId || !courseId || !chapterId) {
      return NextResponse.json({ error: "Video ID, Course ID, and Chapter ID are required" }, { status: 400 });
    }
    
    // Check if video exists and belongs to the correct chapter/course
    const checkParams = {
      TableName: VIDEOS_TABLE_NAME,
      Key: {
        videoId: { S: videoId }
      }
    };
    
    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    if (Item.chapterId.S !== chapterId || Item.courseId.S !== courseId) {
      return NextResponse.json({ error: "Video does not belong to this chapter/course" }, { status: 400 });
    }
    
    // Get the S3 file key
    const fileKey = Item.fileKey.S;
    
    // Delete from S3
    const deleteS3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    };
    
    await s3.send(new DeleteObjectCommand(deleteS3Params));
    
    // Delete from DynamoDB
    const deleteDbParams = {
      TableName: VIDEOS_TABLE_NAME,
      Key: {
        videoId: { S: videoId }
      }
    };
    
    await dynamoDB.send(new DeleteItemCommand(deleteDbParams));
    
    return NextResponse.json(
      { message: "Video deleted successfully", videoId, fileKey },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: error.message || "Video deletion failed" }, { status: 500 });
  }
}