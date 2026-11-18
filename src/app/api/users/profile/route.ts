import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { User } from "@/models/User";

export async function GET() {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};
    for (const key of [
      "name",
      "phone",
      "addresses",
      "emergencyContact",
      "preferences",
      "notifications",
    ]) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      { new: true }
    );

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
