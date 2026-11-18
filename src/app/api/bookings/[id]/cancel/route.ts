import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Booking } from "@/models/Booking";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json(
        { message: "Cannot cancel this booking" },
        { status: 400 }
      );
    }

    booking.status = "cancelled";
    booking.cancelReason = body.reason || "Cancelled by customer";
    booking.statusHistory = booking.statusHistory || [];
    booking.statusHistory.push({
      status: "cancelled",
      at: new Date(),
      note: booking.cancelReason,
    });
    if (booking.payment?.status === "paid") {
      booking.payment.status = "refunded";
    }
    await booking.save();

    return NextResponse.json({ booking });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Cancel failed" }, { status: 500 });
  }
}
