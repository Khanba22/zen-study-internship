import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
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

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const CHAPTERS_TABLE_NAME = "Chapters";
const COURSES_TABLE_NAME = "Courses";

// CREATE - Create a chapter folder under a course and add to Chapters table
export async function POST(req) {
  try {
    const { courseId, chapterName, description, duration, order } = await req.json();
    
    if (!courseId || !chapterName) {
      return NextResponse.json({ error: "Course ID and chapter name are required" }, { status: 400 });
    }

    // Verify that the course exists
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

    const courseName = courseItem.courseName.S;
    
    // Generate a unique chapterId
    const chapterId = randomUUID();
    
    // Create the chapter folder in S3
    const folderKey = `course/${courseId}/${chapterId}/`;
    const createParams = {
      Bucket: BUCKET_NAME,
      Key: folderKey,
      Body: "",
    };

    await s3.send(new PutObjectCommand(createParams));

    // Store chapter info in DynamoDB
    const chapterParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Item: {
        chapterId: { S: chapterId },
        courseId: { S: courseId },
        chapterName: { S: chapterName },
        description: { S: description || "No description provided" },
        duration: duration ? { N: duration.toString() } : { N: "0" },
        order: order ? { N: order.toString() } : { N: "0" },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
        isActive: { BOOL: true }
      }
    };

    await dynamoDB.send(new PutItemCommand(chapterParams));

    return NextResponse.json({
      message: "Chapter created successfully",
      chapter: {
        chapterId,
        courseId,
        courseName,
        chapterName,
        description: description || "No description provided",
        duration: duration || 0,
        order: order || 0,
        folderKey
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json({ error: error.message || "Chapter creation failed" }, { status: 500 });
  }
}

// READ - Get all chapters of a course or a specific chapter
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Verify that the course exists
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

    // Get a specific chapter
    if (chapterId) {
      const chapterParams = {
        TableName: CHAPTERS_TABLE_NAME,
        Key: {
          chapterId: { S: chapterId }
        }
      };

      const { Item } = await dynamoDB.send(new GetItemCommand(chapterParams));
      
      if (!Item) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      }

      // Verify that the chapter belongs to the specified course
      if (Item.courseId.S !== courseId) {
        return NextResponse.json({ error: "Chapter does not belong to the specified course" }, { status: 400 });
      }

      // Transform DynamoDB response
      const chapter = {
        chapterId: Item.chapterId.S,
        courseId: Item.courseId.S,
        courseName: courseItem.courseName.S,
        chapterName: Item.chapterName.S,
        description: Item.description.S,
        duration: Item.duration?.N ? parseInt(Item.duration.N) : 0,
        order: Item.order?.N ? parseInt(Item.order.N) : 0,
        createdAt: Item.createdAt.S,
        updatedAt: Item.updatedAt.S,
        isActive: Item.isActive?.BOOL !== undefined ? Item.isActive.BOOL : true
      };

      return NextResponse.json({ chapter }, { status: 200 });
    } 
    // Get all chapters for a course
    else {
      const chaptersParams = {
        TableName: CHAPTERS_TABLE_NAME,
        ExpressionAttributeValues: {
          ":courseId": { S: courseId }
        },
        KeyConditionExpression: "courseId = :courseId",
        IndexName: "courseId-index" // Assuming a GSI on courseId
      };

      // If GSI doesn't exist, fall back to scan with filter
      let chapters;
      try {
        const { Items } = await dynamoDB.send(new QueryCommand(chaptersParams));
        chapters = Items;
      } catch (error) {
        // If the query fails (likely due to missing GSI), fall back to scan
        const scanParams = {
          TableName: CHAPTERS_TABLE_NAME,
          FilterExpression: "courseId = :courseId",
          ExpressionAttributeValues: {
            ":courseId": { S: courseId }
          }
        };
        const { Items } = await dynamoDB.send(new ScanCommand(scanParams));
        chapters = Items;
      }

      // Transform DynamoDB response
      const formattedChapters = chapters.map(item => ({
        chapterId: item.chapterId.S,
        courseId: item.courseId.S,
        courseName: courseItem.courseName.S,
        chapterName: item.chapterName.S,
        description: item.description.S,
        duration: item.duration?.N ? parseInt(item.duration.N) : 0,
        order: item.order?.N ? parseInt(item.order.N) : 0,
        createdAt: item.createdAt.S,
        updatedAt: item.updatedAt.S,
        isActive: item.isActive?.BOOL !== undefined ? item.isActive.BOOL : true
      }));

      // Sort chapters by order
      formattedChapters.sort((a, b) => a.order - b.order);

      return NextResponse.json({ chapters: formattedChapters }, { status: 200 });
    }
  } catch (error) {
    console.error("Get chapter(s) error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve chapter(s)" }, { status: 500 });
  }
}

// UPDATE - Update a chapter
export async function PUT(req) {
  try {
    const { chapterId, chapterName, description, duration, order, isActive } = await req.json();
    
    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    // Check if chapter exists
    const checkParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Key: {
        chapterId: { S: chapterId }
      }
    };

    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseId = Item.courseId.S;

    // Build update expression and attribute values
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": { S: new Date().toISOString() }
    };

    if (chapterName) {
      updateExpression += ", chapterName = :chapterName";
      expressionAttributeValues[":chapterName"] = { S: chapterName };
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

    // Update chapter in DynamoDB
    const updateParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Key: {
        chapterId: { S: chapterId }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: order !== undefined ? { "#order": "order" } : undefined,
      ReturnValues: "ALL_NEW"
    };

    const { Attributes } = await dynamoDB.send(new UpdateItemCommand(updateParams));

    // Get course info
    const courseParams = {
      TableName: COURSES_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      }
    };

    const { Item: courseItem } = await dynamoDB.send(new GetItemCommand(courseParams));

    // Transform DynamoDB response
    const updatedChapter = {
      chapterId: Attributes.chapterId.S,
      courseId: Attributes.courseId.S,
      courseName: courseItem?.courseName?.S || "Unknown Course",
      chapterName: Attributes.chapterName.S,
      description: Attributes.description.S,
      duration: Attributes.duration?.N ? parseInt(Attributes.duration.N) : 0,
      order: Attributes.order?.N ? parseInt(Attributes.order.N) : 0,
      createdAt: Attributes.createdAt.S,
      updatedAt: Attributes.updatedAt.S,
      isActive: Attributes.isActive?.BOOL !== undefined ? Attributes.isActive.BOOL : true
    };

    return NextResponse.json(
      { message: "Chapter updated successfully", chapter: updatedChapter },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update chapter error:", error);
    return NextResponse.json({ error: error.message || "Chapter update failed" }, { status: 500 });
  }
}

// DELETE - Delete a chapter from a course
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');
    
    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    // Check if chapter exists and get its courseId
    const checkParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Key: {
        chapterId: { S: chapterId }
      }
    };

    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseId = Item.courseId.S;

    // Delete all objects in the chapter folder
    const folderKey = `course/${courseId}/${chapterId}/`;
    
    // List all objects in the folder
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: folderKey
    };

    const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      // Delete each object
      await Promise.all(listedObjects.Contents.map(({ Key }) => {
        const deleteParams = {
          Bucket: BUCKET_NAME,
          Key
        };
        return s3.send(new DeleteObjectCommand(deleteParams));
      }));
    }

    // Delete the folder marker itself
    const deleteFolderParams = {
      Bucket: BUCKET_NAME,
      Key: folderKey
    };
    await s3.send(new DeleteObjectCommand(deleteFolderParams));

    // Delete the chapter from DynamoDB
    const deleteParams = {
      TableName: CHAPTERS_TABLE_NAME,
      Key: {
        chapterId: { S: chapterId }
      }
    };

    await dynamoDB.send(new DeleteItemCommand(deleteParams));

    return NextResponse.json(
      { message: "Chapter deleted successfully", chapterId, courseId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json({ error: error.message || "Chapter deletion failed" }, { status: 500 });
  }
}