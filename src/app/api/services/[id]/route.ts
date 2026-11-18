import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const service =
      (await Service.findOne({ slug: id, isActive: true })) ||
      (await Service.findById(id).catch(() => null));

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load service" }, { status: 500 });
  }
}
