import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { requireUser } from "@/lib/session";
import { emitBookingUpdate } from "@/lib/socket";
import { Booking } from "@/models/Booking";
import { Professional } from "@/models/Professional";

const schema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    const data = schema.parse(await req.json());
    await connectDB();
    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (["completed", "cancelled"].includes(booking.status)) {
      return NextResponse.json(
        { message: "Cannot reschedule this booking" },
        { status: 400 }
      );
    }

    booking.date = data.date;
    booking.time = data.time;
    booking.statusHistory = booking.statusHistory || [];
    booking.statusHistory.push({
      status: booking.status,
      at: new Date(),
      note: `Rescheduled to ${data.date} ${data.time}`,
    });
    await booking.save();

    if (booking.professional) {
      const professional = await Professional.findById(booking.professional);
      if (professional?.user) {
        await createNotification({
          userId: professional.user.toString(),
          title: "Booking rescheduled",
          message: `${booking.bookingId} moved to ${data.date} ${data.time}`,
          type: "booking",
          link: "/pro/dashboard",
        });
      }
    }

    emitBookingUpdate(String(booking._id), { booking });
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid date/time" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Reschedule failed" }, { status: 500 });
  }
}
