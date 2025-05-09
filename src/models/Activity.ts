// models/Activity.ts
import mongoose from "mongoose";
import { ActivityType, ActivityStatus } from "@/types/activity";

const activitySchema = new mongoose.Schema(
  {
    prospectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prospect",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.PENDING,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This should match the model name in UserModel
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to update `updatedAt`
activitySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Use a consistent approach to model creation/retrieval
const ActivityModel =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default ActivityModel;
