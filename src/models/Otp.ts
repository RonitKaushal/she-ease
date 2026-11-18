import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const otpSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type IOtp = InferSchemaType<typeof otpSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);
