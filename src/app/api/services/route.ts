import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const popular = searchParams.get("popular");

    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (popular === "true") filter.popular = true;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const services = await Service.find(filter).sort({ popular: -1, name: 1 });
    return NextResponse.json({ services });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load services" }, { status: 500 });
  }
}
