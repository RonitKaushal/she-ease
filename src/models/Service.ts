import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const packageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    durationMins: { type: Number, default: 60 },
    includes: { type: [String], default: [] },
  },
  { _id: true }
);

const addonSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    startingPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
    packages: { type: [packageSchema], default: [] },
    addons: { type: [addonSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    rating: { type: Number, default: 4.7 },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type IService = InferSchemaType<typeof serviceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);
