import mongoose from 'mongoose';
import videoSchema from './Video.js';

const courseSchema = new mongoose.Schema({
  courseTitle: {
    type: String,
    required: true,
    trim: true,
  },
  courseDescription: {
    type: String,
    required: true,
    trim: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  videos: {
    type: [videoSchema], // Use the imported `videoSchema`
    default: [],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field
courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
