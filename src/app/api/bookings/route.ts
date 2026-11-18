import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { calculatePricing } from "@/lib/pricing";
import { requireUser, getProfessionalForUser } from "@/lib/session";
import { emitBookingUpdate } from "@/lib/socket";
import { Booking } from "@/models/Booking";
import { Professional } from "@/models/Professional";
import { Service } from "@/models/Service";

const createSchema = z.object({
  serviceId: z.string().optional(),
  professionalId: z.string().optional(),
  packageName: z.string().optional(),
  addons: z.array(z.string()).optional(),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Enter a valid 10-digit phone number",
    }),
  specialInstructions: z.string().optional(),
  serviceType: z.enum(["standard", "express"]).default("standard"),
  paymentMethod: z.enum(["card", "upi", "cash", "razorpay"]).default("cash"),
  promoCode: z.string().optional(),
  address: z.object({
    street: z
      .string()
      .trim()
      .min(3, "Enter a full street address (at least 3 characters)"),
    city: z.string().trim().min(2, "City is required"),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    state: z.string().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
  }),
  serviceName: z.string().optional(),
  category: z.string().optional(),
  baseCost: z.number().optional(),
});

export async function GET(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "professional") {
      const pro = await getProfessionalForUser(session.user.id);
      if (!pro) {
        return NextResponse.json({ message: "Pro profile missing" }, { status: 404 });
      }
      const bookings = await Booking.find({ professional: pro._id })
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });
      return NextResponse.json({ bookings });
    }

    const bookings = await Booking.find({ user: session.user.id })
      .populate("professional", "name profession rating avatar verified")
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error, session } = await requireUser();
  if (error || !session) return error!;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    await connectDB();

    let serviceDoc = null;
    if (data.serviceId) {
      serviceDoc =
        (await Service.findById(data.serviceId).catch(() => null)) ||
        (await Service.findOne({ slug: data.serviceId }));
    }

    let professional = null;
    if (data.professionalId) {
      professional = await Professional.findById(data.professionalId);
    } else if (serviceDoc || data.category) {
      const category = (serviceDoc?.category || data.category) as
        | "cleaning"
        | "beauty"
        | "plumbing"
        | "electrical"
        | "carpentry"
        | "painting"
        | "appliance"
        | "pest-control"
        | "moving"
        | "laundry"
        | "gardening"
        | "hvac"
        | undefined;
      if (category) {
        professional = await Professional.findOne({
          category,
          isAvailable: true,
          verified: true,
        }).sort({ rating: -1 });
      }
    }

    let baseCost = data.baseCost || 0;
    if (!baseCost && serviceDoc) {
      const pkg = serviceDoc.packages?.find(
        (p) => p.name === data.packageName
      );
      baseCost = pkg?.price || serviceDoc.startingPrice;
      if (data.addons?.length) {
        for (const name of data.addons) {
          const addon = serviceDoc.addons?.find((a) => a.name === name);
          if (addon) baseCost += addon.price;
        }
      }
    }
    if (!baseCost && professional) {
      baseCost = professional.priceAmount || 500;
    }
    if (!baseCost) baseCost = 499;

    const pricing = calculatePricing({
      baseCost,
      serviceType: data.serviceType,
      promoCode: data.promoCode,
    });

    const addressFull = `${data.address.street}, ${data.address.city} ${data.address.pincode}`;

    const booking = await Booking.create({
      user: session.user.id,
      professional: professional?._id || null,
      serviceRef: serviceDoc?._id || null,
      service: {
        name: serviceDoc?.name || data.serviceName || "Home Service",
        category: serviceDoc?.category || data.category || "cleaning",
        packageName: data.packageName || "",
        addons: data.addons || [],
      },
      date: data.date,
      time: data.time,
      address: {
        street: data.address.street,
        city: data.address.city,
        pincode: data.address.pincode,
        state: data.address.state || "Maharashtra",
        full: addressFull,
        lat: data.address.lat ?? null,
        lng: data.address.lng ?? null,
      },
      phone: data.phone,
      specialInstructions: data.specialInstructions || "",
      serviceType: data.serviceType,
      status: professional ? "confirmed" : "pending",
      statusHistory: [
        {
          status: "pending",
          at: new Date(),
          note: "Booking created",
        },
        ...(professional
          ? [
              {
                status: "confirmed",
                at: new Date(),
                note: "Professional assigned",
              },
            ]
          : []),
      ],
      payment: {
        method: data.paymentMethod,
        status:
          data.paymentMethod === "cash" || data.paymentMethod === "razorpay"
            ? "pending"
            : "paid",
        ...pricing,
        paidAt:
          data.paymentMethod === "cash" || data.paymentMethod === "razorpay"
            ? undefined
            : new Date(),
      },
    });

    if (professional) {
      await Professional.findByIdAndUpdate(professional._id, {
        $inc: { totalBookings: 1 },
      });
      await createNotification({
        userId: professional.user.toString(),
        title: "New booking request",
        message: `${booking.bookingId} · ${booking.service?.name || "Service"}`,
        type: "booking",
        link: "/pro/dashboard",
      });
    }

    await createNotification({
      userId: session.user.id,
      title: "Booking created",
      message: `${booking.bookingId} scheduled for ${booking.date} ${booking.time}`,
      type: "booking",
      link: "/dashboard?tab=bookings",
    });

    emitBookingUpdate(String(booking._id), { booking });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.issues[0]?.message || "Invalid booking data" },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ message: "Booking failed" }, { status: 500 });
  }
}
