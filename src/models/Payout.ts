import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const payoutSchema = new Schema(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    method: { type: String, default: "bank_transfer" },
    note: { type: String, default: "" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type IPayout = InferSchemaType<typeof payoutSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Payout: Model<IPayout> =
  mongoose.models.Payout || mongoose.model<IPayout>("Payout", payoutSchema);
