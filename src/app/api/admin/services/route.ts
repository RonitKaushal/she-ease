import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { Service } from "@/models/Service";

const schema = z.object({
  name: z.string().min(2),
  category: z.enum([
    "cleaning",
    "beauty",
    "plumbing",
    "electrical",
    "carpentry",
    "painting",
    "appliance",
    "pest-control",
    "moving",
    "laundry",
    "gardening",
    "hvac",
  ]),
  description: z.string().optional(),
  startingPrice: z.number().min(0),
  popular: z.boolean().optional(),
  image: z.string().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const services = await Service.find().sort({ name: 1 });
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = schema.parse(await req.json());
    await connectDB();
    const service = await Service.create({
      ...data,
      slug: slugify(data.name),
      packages: [
        {
          name: "Standard",
          description: "Standard package",
          price: data.startingPrice,
          durationMins: 60,
          includes: ["Service visit"],
        },
      ],
      features: ["Admin curated"],
      isActive: true,
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.issues[0]?.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Create failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    await connectDB();
    const service = await Service.findByIdAndUpdate(
      body.id,
      {
        $set: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.startingPrice !== undefined
            ? { startingPrice: body.startingPrice }
            : {}),
          ...(body.popular !== undefined ? { popular: body.popular } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
          ...(body.description ? { description: body.description } : {}),
        },
      },
      { new: true }
    );
    return NextResponse.json({ service });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
