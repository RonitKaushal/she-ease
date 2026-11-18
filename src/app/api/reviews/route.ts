import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Booking } from "@/models/Booking";
import { Review } from "@/models/Review";

const schema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("professionalId");
    if (!professionalId) {
      return NextResponse.json({ message: "professionalId required" }, { status: 400 });
    }

    const reviews = await Review.find({
      professional: professionalId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    const data = schema.parse(await req.json());
    await connectDB();

    const booking = await Booking.findById(data.bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "completed") {
      return NextResponse.json(
        { message: "Only completed bookings can be reviewed" },
        { status: 400 }
      );
    }
    if (booking.isReviewed) {
      return NextResponse.json({ message: "Already reviewed" }, { status: 400 });
    }
    if (!booking.professional) {
      return NextResponse.json(
        { message: "No professional assigned" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      user: session.user.id,
      professional: booking.professional,
      booking: booking._id,
      rating: data.rating,
      comment: data.comment || "",
    });

    booking.isReviewed = true;
    await booking.save();

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid review" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Review failed" }, { status: 500 });
  }
}
