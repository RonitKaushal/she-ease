import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Booking } from "@/models/Booking";

const schema = z.object({
  bookingId: z.string(),
});

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

    const amount = booking.payment?.total || 0;
    const orderId = `order_demo_${booking.bookingId}_${Date.now()}`;

    booking.payment = {
      method: "razorpay",
      status: booking.payment?.status || "pending",
      baseCost: booking.payment?.baseCost || amount,
      discount: booking.payment?.discount || 0,
      taxes: booking.payment?.taxes || 0,
      total: amount,
      promoCode: booking.payment?.promoCode || "",
      razorpayOrderId: orderId,
      razorpayPaymentId: booking.payment?.razorpayPaymentId || "",
      paidAt: booking.payment?.paidAt,
    };
    await booking.save();

    return NextResponse.json({
      order: {
        id: orderId,
        amount: Math.round(amount * 100),
        currency: "INR",
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo",
        name: "SheEase",
        description: `Payment for ${booking.bookingId}`,
        mode: process.env.RAZORPAY_KEY_SECRET ? "live-test" : "simulated",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Order failed" }, { status: 500 });
  }
}
