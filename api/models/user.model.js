import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number, 
      default: null, 
    },
    otpExpires: {
      type: Date, 
      default: null,
    },
    isVerified: {
      type: Boolean, 
      default: false,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
