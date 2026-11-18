import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";
import { Review } from "@/models/Review";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const professional = await Professional.findById(id);
    if (!professional) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const reviews = await Review.find({
      professional: id,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ professional, reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load professional" }, { status: 500 });
  }
}
