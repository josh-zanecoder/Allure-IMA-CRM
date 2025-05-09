import mongoose from "mongoose";
import { Interest, Status, CAMPUS } from "@/types/prospect";

// Define an interface to extend the Document type to include our custom property
interface ProspectDocument extends mongoose.Document {
  _campusValue?: string;
}

const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: false },
    id: { type: String, required: false },
    email: { type: String, required: false },
    role: { type: String, required: false },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
  },
  { _id: false }
);

const prospectSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: {
      type: String,
      required: false,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    address: { type: addressSchema, required: false },
    educationLevel: {
      type: Number,
      required: false,
      min: 1,
      max: 20,
    },
    gender: { type: String, required: false },
    genderOther: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    preferredContactMethod: { type: String, required: false },
    campus: {
      type: String,
      required: false,
      set: function (this: ProspectDocument, v: string) {
        console.log("Setting campus field to:", v);
        this._campusValue = v;
        return v;
      },
    },
    interests: {
      type: [String],
      required: false,
    },
    notes: { type: String, required: false },
    status: {
      type: String,
      required: false,
      enum: Object.values(Status),
      default: "New",
    },
    lastContact: {
      type: Date,
      required: false,
      default: Date.now,
    },
    addedBy: { type: userSchema, required: false },
    assignedTo: { type: userSchema, required: false },
  },
  {
    timestamps: true,
    strict: false,
  }
);

prospectSchema.index({ fullName: 1 });
prospectSchema.index({ firstName: 1, lastName: 1 });
prospectSchema.index({ phone: 1 }, { unique: true, sparse: true });
prospectSchema.index({ email: 1 }, { unique: true, sparse: true });

mongoose.set("debug", true);

// Type the callback functions properly
prospectSchema.pre("save", function (this: ProspectDocument, next) {
  console.log("Document before save:", JSON.stringify(this.toJSON(), null, 2));

  if (this._campusValue) {
    console.log("Found campus value in _campusValue:", this._campusValue);
    this.set("campus", this._campusValue, { strict: false });
  } else if (this.get("campus")) {
    console.log("Campus field already set:", this.get("campus"));
  } else {
    console.log("No campus value found in document");
  }

  next();
});

prospectSchema.post("save", function (this: ProspectDocument) {
  console.log("Document after save:", JSON.stringify(this.toJSON(), null, 2));
  console.log("Campus in saved document:", this.get("campus"));
});

const Prospect =
  mongoose.models.Prospect ||
  mongoose.model<ProspectDocument>("Prospect", prospectSchema);

export default Prospect;
