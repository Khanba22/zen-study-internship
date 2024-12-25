import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Reference to the Course model
      },
    ],
    roles: {
      type: [String],
      default: ['user'], // Roles like 'admin', 'user', etc.
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const User = mongoose.models['User'] || mongoose.model('User', userSchema);

export default User;
