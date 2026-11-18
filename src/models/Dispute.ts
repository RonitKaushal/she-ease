import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const disputeSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    againstRole: {
      type: String,
      enum: ["user", "professional", "platform"],
      default: "professional",
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in-review", "resolved", "rejected"],
      default: "open",
    },
    resolution: { type: String, default: "" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type IDispute = InferSchemaType<typeof disputeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", disputeSchema);
