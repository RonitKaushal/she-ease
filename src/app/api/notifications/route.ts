import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Notification } from "@/models/Notification";

export async function GET() {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  await connectDB();
  const notifications = await Notification.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(40);

  const unread = await Notification.countDocuments({
    user: session.user.id,
    read: false,
  });

  return NextResponse.json({ notifications, unread });
}

export async function PUT(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  await connectDB();
  const body = await req.json().catch(() => ({}));
  if (body.id) {
    await Notification.findOneAndUpdate(
      { _id: body.id, user: session.user.id },
      { read: true }
    );
  } else {
    await Notification.updateMany(
      { user: session.user.id, read: false },
      { read: true }
    );
  }
  return NextResponse.json({ ok: true });
}
