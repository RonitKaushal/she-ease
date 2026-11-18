import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Booking } from "@/models/Booking";
import { Dispute } from "@/models/Dispute";
import { Professional } from "@/models/Professional";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const [
    users,
    professionals,
    pendingPros,
    services,
    bookings,
    revenue,
    openDisputes,
  ] = await Promise.all([
    User.countDocuments({ type: "user" }),
    Professional.countDocuments(),
    Professional.countDocuments({ verificationStatus: "pending" }),
    Service.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$payment.total" } } },
    ]),
    Dispute.countDocuments({ status: { $in: ["open", "in-review"] } }),
  ]);

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user", "name email")
    .populate("professional", "name");

  return NextResponse.json({
    stats: {
      users,
      professionals,
      pendingPros,
      services,
      bookings,
      revenue: revenue[0]?.total || 0,
      openDisputes,
    },
    recentBookings,
  });
}
