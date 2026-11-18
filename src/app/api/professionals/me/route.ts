import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePro, getProfessionalForUser } from "@/lib/session";
import { Professional } from "@/models/Professional";

export async function GET() {
  const { error, session } = await requirePro();
  if (error || !session) return error!;

  await connectDB();
  const professional = await getProfessionalForUser(session.user.id);
  if (!professional) {
    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    professional,
    stats: {
      rating: professional.rating,
      totalReviews: professional.totalReviews,
      completedBookings: professional.completedBookings,
      earnings: professional.earnings,
      isAvailable: professional.isAvailable,
      verificationStatus: professional.verificationStatus,
    },
  });
}

export async function PUT(req: Request) {
  const { error, session } = await requirePro();
  if (error || !session) return error!;

  try {
    await connectDB();
    const body = await req.json();
    const allowed = [
      "profession",
      "description",
      "bio",
      "skills",
      "experience",
      "priceAmount",
      "location",
      "city",
      "serviceArea",
      "languages",
      "isAvailable",
      "phone",
      "documents",
      "workingHours",
      "avatar",
    ] as const;

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (typeof body.priceAmount === "number") {
      update.price = `₹${body.priceAmount}/visit`;
    }
    if (body.documents) {
      update.verificationStatus = "pending";
      update.verified = false;
    }

    const professional = await Professional.findOneAndUpdate(
      { user: session.user.id },
      { $set: update },
      { new: true }
    );

    return NextResponse.json({ professional });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
