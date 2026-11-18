import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePro, getProfessionalForUser, requireAdmin } from "@/lib/session";
import { Payout } from "@/models/Payout";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");

  if (scope === "admin") {
    const { error } = await requireAdmin();
    if (error) return error;
    await connectDB();
    const payouts = await Payout.find()
      .populate("professional", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    return NextResponse.json({ payouts });
  }

  const { error, session } = await requirePro();
  if (error || !session) return error!;

  await connectDB();
  const pro = await getProfessionalForUser(session.user.id);
  if (!pro) {
    return NextResponse.json({ message: "Pro profile missing" }, { status: 404 });
  }

  const payouts = await Payout.find({ professional: pro._id }).sort({
    createdAt: -1,
  });
  return NextResponse.json({ payouts });
}
