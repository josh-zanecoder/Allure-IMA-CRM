import mongoose, { Schema, Document } from "mongoose";

export interface ICallActivity extends Document {
  to: string;
  from: string;
  userId: string;
  prospectId: string;
  memberId?: string;
  callSid: string;
  parentCallSid?: string;
  activityId: string;
  activityType: string;
  notes: string;
  duration?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallActivitySchema: Schema = new Schema(
  {
    to: { type: String, required: true },
    from: { type: String, required: true },
    userId: { type: String, required: true },
    prospectId: { type: String, required: true },
    callSid: { type: String, required: true },
    memberId: { type: String, required: false },
    parentCallSid: { type: String, required: false },
    activityId: { type: String, required: true },
    activityType: { type: String, required: true, default: "call" },
    notes: { type: String, required: true, default: "Call activity" },
    duration: { type: Number, required: false },
    status: { type: String, required: true, default: "initiated" },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
CallActivitySchema.index({ userId: 1 });
CallActivitySchema.index({ prospectId: 1 });
CallActivitySchema.index({ memberId: 1 });
CallActivitySchema.index({ callSid: 1 });
CallActivitySchema.index({ createdAt: 1 });

// Use the existing model if it exists, otherwise create a new one
export const CallActivity =
  mongoose.models.CallActivity ||
  mongoose.model<ICallActivity>("CallActivity", CallActivitySchema);
