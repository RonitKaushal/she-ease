import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { requireUser } from "@/lib/session";
import { emitBookingUpdate } from "@/lib/socket";
import { Booking } from "@/models/Booking";

const schema = z.object({
  bookingId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
});

export async function POST(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    const data = schema.parse(await req.json());
    await connectDB();
    const booking = await Booking.findById(data.bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const paymentId =
      data.razorpayPaymentId || `pay_demo_${Date.now()}`;

    if (!booking.payment) {
      return NextResponse.json({ message: "No payment info" }, { status: 400 });
    }

    booking.payment.method = "razorpay";
    booking.payment.status = "paid";
    booking.payment.razorpayOrderId = data.razorpayOrderId;
    booking.payment.razorpayPaymentId = paymentId;
    booking.payment.paidAt = new Date();
    await booking.save();

    await createNotification({
      userId: session.user.id,
      title: "Payment successful",
      message: `Paid ₹${booking.payment.total} for ${booking.bookingId}`,
      type: "payment",
      link: `/dashboard/invoices/${booking._id}`,
    });

    emitBookingUpdate(String(booking._id), { booking });
    return NextResponse.json({ booking, paymentId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid payment" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Verify failed" }, { status: 500 });
  }
}
