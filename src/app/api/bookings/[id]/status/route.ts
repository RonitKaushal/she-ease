import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { requirePro, getProfessionalForUser } from "@/lib/session";
import { emitBookingUpdate } from "@/lib/socket";
import { Booking } from "@/models/Booking";
import { Payout } from "@/models/Payout";
import { Professional } from "@/models/Professional";

const schema = z.object({
  status: z.enum([
    "confirmed",
    "en-route",
    "in-progress",
    "completed",
    "cancelled",
  ]),
  note: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requirePro();
  if (error || !session) return error!;

  try {
    const data = schema.parse(await req.json());
    await connectDB();
    const { id } = await params;
    const pro = await getProfessionalForUser(session.user.id);
    if (!pro) {
      return NextResponse.json({ message: "Pro profile missing" }, { status: 404 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (booking.professional?.toString() !== pro._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    booking.status = data.status;
    booking.statusHistory = booking.statusHistory || [];
    booking.statusHistory.push({
      status: data.status,
      at: new Date(),
      note: data.note || `Marked ${data.status}`,
    });

    if (data.status === "completed") {
      const amount = booking.payment?.total || 0;
      booking.payment = {
        method: booking.payment?.method || "cash",
        status: "paid",
        baseCost: booking.payment?.baseCost || 0,
        discount: booking.payment?.discount || 0,
        taxes: booking.payment?.taxes || 0,
        total: amount,
        promoCode: booking.payment?.promoCode || "",
        razorpayOrderId: booking.payment?.razorpayOrderId || "",
        razorpayPaymentId: booking.payment?.razorpayPaymentId || "",
        paidAt: new Date(),
      };
      await Professional.findByIdAndUpdate(pro._id, {
        $inc: {
          completedBookings: 1,
          earnings: amount,
        },
      });

      await Payout.create({
        professional: pro._id,
        booking: booking._id,
        amount: Math.round(amount * 0.8),
        status: "paid",
        method: "bank_transfer",
        note: `Payout for ${booking.bookingId}`,
        paidAt: new Date(),
      });
    }

    await booking.save();

    await createNotification({
      userId: booking.user.toString(),
      title: "Booking update",
      message: `${booking.bookingId} is now ${data.status}`,
      type: "booking",
      link: "/dashboard?tab=bookings",
    });

    emitBookingUpdate(String(booking._id), { booking });
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
