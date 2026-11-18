import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Otp } from "@/models/Otp";

const schema = z.object({
  phone: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const phone = body.phone.replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      return NextResponse.json(
        { message: "Enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    await connectDB();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ phone, code, expiresAt });

    // Local/dev: return OTP in response (no SMS gateway)
    return NextResponse.json({
      message: "OTP sent",
      phone,
      expiresIn: 300,
      demoOtp: code,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid phone" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
