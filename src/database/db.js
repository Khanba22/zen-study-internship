import mongoose from "mongoose";


const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/test");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}

export default connectToMongoDB;
 
//  Now, we can import the  connectToMongoDB  function in our  index.ts  file and call it to connect to the MongoDB database.
