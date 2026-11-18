import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const bookingSchema = new Schema(
  {
    bookingId: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      default: null,
    },
    serviceRef: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    service: {
      name: { type: String, required: true },
      category: { type: String, required: true },
      packageName: { type: String, default: "" },
      addons: { type: [String], default: [] },
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, default: "Maharashtra" },
      full: { type: String, required: true },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    phone: { type: String, required: true },
    specialInstructions: { type: String, default: "" },
    serviceType: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "en-route",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
    payment: {
      method: {
        type: String,
        enum: ["card", "upi", "cash", "razorpay"],
        default: "cash",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      baseCost: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      promoCode: { type: String, default: "" },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      paidAt: { type: Date },
    },
    isReviewed: { type: Boolean, default: false },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.pre("save", function generateBookingId() {
  if (!this.bookingId) {
    this.bookingId =
      "SE" +
      Date.now().toString().slice(-6) +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
  }
  if (!this.statusHistory?.length) {
    this.statusHistory.push({
      status: this.status || "pending",
      at: new Date(),
      note: "Booking created",
    });
  }
});

export type IBooking = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
