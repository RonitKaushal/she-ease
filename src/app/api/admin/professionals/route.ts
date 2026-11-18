import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { requireAdmin } from "@/lib/session";
import { Professional } from "@/models/Professional";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const professionals = await Professional.find().sort({ createdAt: -1 });
  return NextResponse.json({ professionals });
}

export async function PUT(req: Request) {
  const { error, session } = await requireAdmin();
  if (error || !session) return error!;

  try {
    const body = await req.json();
    await connectDB();
    const pro = await Professional.findById(body.id);
    if (!pro) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (body.verificationStatus) {
      pro.verificationStatus = body.verificationStatus;
      pro.verified = body.verificationStatus === "approved";
      pro.verificationNote = body.verificationNote || "";
    }
    if (typeof body.isAvailable === "boolean") {
      pro.isAvailable = body.isAvailable;
    }
    await pro.save();

    await createNotification({
      userId: pro.user.toString(),
      title: "Verification update",
      message:
        body.verificationStatus === "approved"
          ? "Your professional profile was approved"
          : body.verificationStatus === "rejected"
            ? `Verification rejected: ${pro.verificationNote || "Please resubmit documents"}`
            : "Verification status updated",
      type: "verification",
      link: "/pro/dashboard",
    });

    return NextResponse.json({ professional: pro });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
