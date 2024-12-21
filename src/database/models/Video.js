import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // Duration in seconds
    required: true,
  },
  thumbnailUrl: {
    type: String, // URL for the video's thumbnail
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default videoSchema;
