import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const search = searchParams.get("search") || searchParams.get("q");
    const minRating = searchParams.get("minRating");
    const maxPrice = searchParams.get("maxPrice");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Number(searchParams.get("limit") || 12));

    const filter: Record<string, unknown> = { isAvailable: true };
    if (category) filter.category = category;
    if (city) filter.city = { $regex: city, $options: "i" };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (maxPrice) filter.priceAmount = { $lte: Number(maxPrice) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { profession: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const [professionals, total] = await Promise.all([
      Professional.find(filter)
        .sort({ rating: -1, totalReviews: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Professional.countDocuments(filter),
    ]);

    return NextResponse.json({
      professionals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to load professionals" },
      { status: 500 }
    );
  }
}
