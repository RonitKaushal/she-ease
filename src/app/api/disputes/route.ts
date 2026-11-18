import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { requireUser, requireAdmin } from "@/lib/session";
import { Booking } from "@/models/Booking";
import { Dispute } from "@/models/Dispute";
import { User } from "@/models/User";

const createSchema = z.object({
  bookingId: z.string(),
  subject: z.string().min(3),
  description: z.string().min(10),
  againstRole: z.enum(["user", "professional", "platform"]).default("professional"),
});

export async function GET() {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  await connectDB();
  const filter =
    session.user.type === "admin"
      ? {}
      : { raisedBy: session.user.id };

  const disputes = await Dispute.find(filter)
    .populate("booking")
    .populate("raisedBy", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ disputes });
}

export async function POST(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    const data = createSchema.parse(await req.json());
    await connectDB();
    const booking = await Booking.findById(data.bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const dispute = await Dispute.create({
      booking: booking._id,
      raisedBy: session.user.id,
      againstRole: data.againstRole,
      subject: data.subject,
      description: data.description,
    });

    const admins = await User.find({ type: "admin", isActive: true });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id.toString(),
          title: "New dispute",
          message: data.subject,
          type: "dispute",
          link: "/admin?tab=disputes",
        })
      )
    );

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.issues[0]?.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { error, session } = await requireAdmin();
  if (error || !session) return error!;

  try {
    const body = await req.json();
    await connectDB();
    const dispute = await Dispute.findById(body.id);
    if (!dispute) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    dispute.status = body.status || dispute.status;
    dispute.resolution = body.resolution || dispute.resolution;
    if (["resolved", "rejected"].includes(dispute.status)) {
      dispute.resolvedBy = session.user.id as never;
      dispute.resolvedAt = new Date();
    }
    await dispute.save();

    await createNotification({
      userId: dispute.raisedBy.toString(),
      title: "Dispute update",
      message: `Your dispute is now ${dispute.status}`,
      type: "dispute",
      link: "/dashboard?tab=disputes",
    });

    return NextResponse.json({ dispute });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
