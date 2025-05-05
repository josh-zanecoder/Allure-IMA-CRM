import mongoose from "mongoose";
import { EducationLevel, Interest, Status } from "@/types/prospect";

const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    id: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

const prospectSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    address: { type: addressSchema, required: true },
    educationLevel: {
      type: String,
      required: true,
      enum: Object.values(EducationLevel),
    },
    dateOfBirth: { type: Date, required: true },
    preferredContactMethod: { type: String, required: true },
    interests: { type: [String], required: true, enum: Object.values(Interest) },
    notes: { type: String },
    status: {
      type: [String],
      required: true,
      enum: Object.values(Status),
      default: "New",
    },
    lastContact: {
      type: Date,
      required: true,
      default: Date.now,
    },
    addedBy: { type: userSchema, required: true },
    assignedTo: { type: userSchema, required: true },
  },
  {
    timestamps: true,
  }
);

prospectSchema.index({ fullName: 1 });
prospectSchema.index({ status: 1 });
prospectSchema.index({ "address.state": 1 });
prospectSchema.index({ educationLevel: 1 });

// Delete the existing model if it exists
if (mongoose.models.Prospect) {
  delete mongoose.models.Prospect;
}

// Create a new model
const Prospect = mongoose.model("Prospect", prospectSchema);

export default Prospect;
