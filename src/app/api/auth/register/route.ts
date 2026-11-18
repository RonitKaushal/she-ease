import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";

const categoryEnum = z.enum([
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
]);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  type: z.enum(["user", "professional"]).default("user"),
  category: categoryEnum.optional(),
  profession: z.string().optional(),
  city: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await connectDB();

    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone || "",
      type: data.type,
      isVerified: true,
    });

    if (data.type === "professional") {
      await Professional.create({
        user: user._id,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || "",
        profession: data.profession || "Home Service Professional",
        category: data.category || "cleaning",
        city: data.city || "Mumbai",
        location: data.city || "Mumbai",
        description: `${data.profession || "Professional"} available on SheEase`,
        price: "₹500/visit",
        priceAmount: 500,
        verified: false,
        isAvailable: true,
      });
    }

    return NextResponse.json(
      {
        message: "Account created",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
