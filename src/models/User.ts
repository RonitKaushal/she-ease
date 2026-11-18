import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, default: "Maharashtra" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["user", "professional", "admin"],
      default: "user",
    },
    avatar: { type: String, default: null },
    addresses: { type: [addressSchema], default: [] },
    emergencyContact: {
      name: String,
      phone: String,
    },
    preferences: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      bookingReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidate: string
) {
  return bcrypt.compare(candidate, this.password);
};

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
