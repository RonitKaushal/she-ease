import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser, getProfessionalForUser } from "@/lib/session";
import { Booking } from "@/models/Booking";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    await connectDB();
    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate("professional", "name profession rating phone verified avatar")
      .populate("user", "name email phone");

    if (!booking) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const userId =
      typeof booking.user === "object" &&
      booking.user &&
      "_id" in booking.user
        ? String(booking.user._id)
        : String(booking.user);
    const isOwner = userId === session.user.id;
    const pro = await getProfessionalForUser(session.user.id);
    const professionalId =
      typeof booking.professional === "object" &&
      booking.professional &&
      "_id" in booking.professional
        ? String(booking.professional._id)
        : booking.professional
          ? String(booking.professional)
          : null;
    const isAssignedPro = pro && professionalId === pro._id.toString();
    const isAdmin = session.user.type === "admin";

    if (!isOwner && !isAssignedPro && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to load booking" }, { status: 500 });
  }
}
