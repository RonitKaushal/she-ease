import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CATEGORY_ENUM = [
  "cleaning",
  "beauty",
  "plumbing",
  "electrical",
  "carpentry",
  "painting",
  "appliance",
  "pest-control",
  "moving",
  "laundry",
  "gardening",
  "hvac",
] as const;

const professionalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    profession: { type: String, required: true },
    category: { type: String, enum: CATEGORY_ENUM, required: true },
    description: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    price: { type: String, default: "" },
    priceAmount: { type: Number, default: 500 },
    location: { type: String, default: "" },
    city: { type: String, default: "Mumbai" },
    pincode: { type: String, default: "" },
    serviceArea: { type: [String], default: [] },
    languages: { type: [String], default: ["English", "Hindi"] },
    avatar: { type: String, default: null },
    verified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNote: { type: String, default: "" },
    documents: {
      idProof: { type: String, default: "" },
      addressProof: { type: String, default: "" },
      certification: { type: String, default: "" },
    },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
      days: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
    },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type IProfessional = InferSchemaType<typeof professionalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Professional: Model<IProfessional> =
  mongoose.models.Professional ||
  mongoose.model<IProfessional>("Professional", professionalSchema);
