import mongoose, { Schema, Document, Model } from "mongoose";

export enum InteractionType {
  CALL = "call",
  EMAIL = "email",
  MEETING = "meeting",
  NOTE = "note",
  SMS = "sms",
  VISIT = "visit",
  OTHER = "other",
}

export enum InteractionStatus {
  PLANNED = "planned",
  INITIATED = "initiated",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface IInteractionRecord extends Document {
  userId: string;
  prospectId: string;
  interactionId: string;
  interactionType: InteractionType;
  subject: string;
  details: string;
  status: InteractionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  extraData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionRecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    prospectId: { type: String, required: true, index: true },
    interactionId: { type: String, required: true, unique: true, index: true },
    interactionType: {
      type: String,
      required: true,
      enum: Object.values(InteractionType),
      default: InteractionType.OTHER,
      index: true,
    },
    subject: { type: String, required: true },
    details: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(InteractionStatus),
      default: InteractionStatus.INITIATED,
      index: true,
    },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },
    extraData: { type: Schema.Types.Mixed }, // For storing type-specific data
  },
  {
    timestamps: true,
    // Add timestampIndexes
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add the timestamp index in a way that's compatible with the schema
InteractionRecordSchema.index({ createdAt: -1 });

// Use a safer model initialization pattern
let InteractionRecord: Model<IInteractionRecord>;

// Only initialize model on the server side
if (typeof window === "undefined") {
  // Check if the model already exists to prevent recompilation
  InteractionRecord =
    (mongoose.models.InteractionRecord as Model<IInteractionRecord>) ||
    mongoose.model<IInteractionRecord>(
      "InteractionRecord",
      InteractionRecordSchema
    );
} else {
  // Create a dummy model for client-side
  // This won't be used for database operations but prevents errors
  InteractionRecord = {} as Model<IInteractionRecord>;
}

export { InteractionRecord };
