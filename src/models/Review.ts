import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { Professional } from "./Professional";

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.post("save", async function updateProfessionalRating(doc) {
  const stats = await mongoose.model("Review").aggregate([
    { $match: { professional: doc.professional, isApproved: true } },
    {
      $group: {
        _id: "$professional",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats[0]) {
    await Professional.findByIdAndUpdate(doc.professional, {
      rating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

export type IReview = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
