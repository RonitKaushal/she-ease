import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Booking } from "@/models/Booking";

export async function GET() {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    await connectDB();
    const bookings = await Booking.find({ user: session.user.id });
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const upcoming = bookings.filter((b) =>
      ["pending", "confirmed", "in-progress"].includes(b.status)
    ).length;
    const spent = bookings
      .filter((b) => b.payment?.status === "paid" || b.status === "completed")
      .reduce((sum, b) => sum + (b.payment?.total || 0), 0);

    return NextResponse.json({
      stats: { total, completed, upcoming, spent },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to load stats" }, { status: 500 });
  }
}
