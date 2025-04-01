import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { 
  DynamoDBClient, 
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
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
const DYNAMO_TABLE_NAME = "Courses";

// CREATE - Create a new course
export async function POST(req) {
  try {
    const { courseName, description, instructor, price, duration, category } = await req.json();
    if (!courseName) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    if (!BUCKET_NAME) {
      return NextResponse.json({ error: "S3 bucket name is missing in environment variables" }, { status: 500 });
    }

    // Generate a unique courseId
    const courseId = randomUUID();

    // Upload empty object to create S3 folder
    const folderKey = `course/${courseId}/`;
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: folderKey,
        Body: Buffer.from(""),
      },
    });
    await upload.done();

    // Store course info in DynamoDB
    const dbParams = {
      TableName: DYNAMO_TABLE_NAME,
      Item: {
        courseId: { S: courseId },
        courseName: { S: courseName },
        description: { S: description || "No description provided" },
        instructor: { S: instructor || "Unknown" },
        price: price ? { N: price.toString() } : { N: "0" },
        duration: duration ? { N: duration.toString() } : { N: "0" },
        category: { S: category || "Uncategorized" },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
        isActive: { BOOL: true }
      },
    };
    await dynamoDB.send(new PutItemCommand(dbParams));

    return NextResponse.json(
      { 
        message: "Course created successfully", 
        course: {
          courseId,
          courseName,
          description: description || "No description provided",
          instructor: instructor || "Unknown",
          price: price || 0,
          duration: duration || 0,
          category: category || "Uncategorized",
          folderKey
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: error.message || "Course creation failed" }, { status: 500 });
  }
}

// READ - Get all courses or a specific course
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    // Get a specific course by ID
    if (courseId) {
      const params = {
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          courseId: { S: courseId }
        }
      };

      const { Item } = await dynamoDB.send(new GetItemCommand(params));
      
      if (!Item) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // Transform DynamoDB response to a more user-friendly format
      const course = {
        courseId: Item.courseId.S,
        courseName: Item.courseName.S,
        description: Item.description.S,
        instructor: Item.instructor.S,
        price: Item.price?.N ? parseFloat(Item.price.N) : 0,
        duration: Item.duration?.N ? parseInt(Item.duration.N) : 0,
        category: Item.category?.S || "Uncategorized",
        createdAt: Item.createdAt.S,
        updatedAt: Item.updatedAt.S,
        isActive: Item.isActive?.BOOL !== undefined ? Item.isActive.BOOL : true
      };

      return NextResponse.json({ course }, { status: 200 });
    } 
    // Get all courses
    else {
      const params = {
        TableName: DYNAMO_TABLE_NAME
      };

      const { Items } = await dynamoDB.send(new ScanCommand(params));
      
      // Transform DynamoDB response
      const courses = Items.map(item => ({
        courseId: item.courseId.S,
        courseName: item.courseName.S,
        description: item.description.S,
        instructor: item.instructor.S,
        price: item.price?.N ? parseFloat(item.price.N) : 0,
        duration: item.duration?.N ? parseInt(item.duration.N) : 0,
        category: item.category?.S || "Uncategorized",
        createdAt: item.createdAt.S,
        updatedAt: item.updatedAt.S,
        isActive: item.isActive?.BOOL !== undefined ? item.isActive.BOOL : true
      }));

      return NextResponse.json({ courses }, { status: 200 });
    }
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve course(s)" }, { status: 500 });
  }
}

// UPDATE - Update an existing course
export async function PUT(req) {
  try {
    const { courseId, courseName, description, instructor, price, duration, category, isActive } = await req.json();
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if course exists
    const checkParams = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      }
    };

    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Build update expression and attribute values
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": { S: new Date().toISOString() }
    };

    if (courseName) {
      updateExpression += ", courseName = :courseName";
      expressionAttributeValues[":courseName"] = { S: courseName };
    }

    if (description !== undefined) {
      updateExpression += ", description = :description";
      expressionAttributeValues[":description"] = { S: description };
    }

    if (instructor !== undefined) {
      updateExpression += ", instructor = :instructor";
      expressionAttributeValues[":instructor"] = { S: instructor };
    }

    if (price !== undefined) {
      updateExpression += ", price = :price";
      expressionAttributeValues[":price"] = { N: price.toString() };
    }

    if (duration !== undefined) {
      updateExpression += ", duration = :duration";
      expressionAttributeValues[":duration"] = { N: duration.toString() };
    }

    if (category !== undefined) {
      updateExpression += ", category = :category";
      expressionAttributeValues[":category"] = { S: category };
    }

    if (isActive !== undefined) {
      updateExpression += ", isActive = :isActive";
      expressionAttributeValues[":isActive"] = { BOOL: isActive };
    }

    // Update course in DynamoDB
    const updateParams = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    };

    const { Attributes } = await dynamoDB.send(new UpdateItemCommand(updateParams));

    // If course name changed, update the S3 folder
    if (courseName && Item.courseName.S !== courseName) {
      // No need to rename S3 folders since we're using courseId for the folder structure
    }

    // Transform DynamoDB response
    const updatedCourse = {
      courseId: Attributes.courseId.S,
      courseName: Attributes.courseName.S,
      description: Attributes.description.S,
      instructor: Attributes.instructor.S,
      price: Attributes.price?.N ? parseFloat(Attributes.price.N) : 0,
      duration: Attributes.duration?.N ? parseInt(Attributes.duration.N) : 0,
      category: Attributes.category?.S || "Uncategorized",
      createdAt: Attributes.createdAt.S,
      updatedAt: Attributes.updatedAt.S,
      isActive: Attributes.isActive?.BOOL !== undefined ? Attributes.isActive.BOOL : true
    };

    return NextResponse.json(
      { message: "Course updated successfully", course: updatedCourse },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: error.message || "Course update failed" }, { status: 500 });
  }
}

// DELETE - Delete a course
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if course exists
    const checkParams = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      }
    };

    const { Item } = await dynamoDB.send(new GetItemCommand(checkParams));
    
    if (!Item) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete from DynamoDB
    const deleteParams = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        courseId: { S: courseId }
      }
    };

    await dynamoDB.send(new DeleteItemCommand(deleteParams));

    // Delete all objects in the course folder
    const folderKey = `course/${courseId}/`;
    
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

    return NextResponse.json(
      { message: "Course deleted successfully", courseId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: error.message || "Course deletion failed" }, { status: 500 });
  }
}