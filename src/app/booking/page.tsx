import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/layout/site-shell";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
    package?: string;
    addons?: string;
    professional?: string;
    category?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/booking");
  }

  const params = await searchParams;
  await connectDB();

  const service =
    (params.service &&
      ((await Service.findOne({ slug: params.service }).lean()) ||
        (await Service.findById(params.service).lean().catch(() => null)))) ||
    null;

  const professional = params.professional
    ? await Professional.findById(params.professional).lean()
    : null;

  const user = await User.findById(session.user.id).lean();
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) ||
    user?.addresses?.[0] || {
      street: "",
      city: "Mumbai",
      pincode: "",
      state: "Maharashtra",
    };

  const packageName =
    params.package || service?.packages?.[0]?.name || "Standard visit";
  const addons = params.addons ? params.addons.split(",").filter(Boolean) : [];

  let baseCost = professional?.priceAmount || service?.startingPrice || 499;
  if (service) {
    const pkg = service.packages?.find((p) => p.name === packageName);
    baseCost = pkg?.price || service.startingPrice;
    for (const name of addons) {
      const addon = service.addons?.find((a) => a.name === name);
      if (addon) baseCost += addon.price;
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
          Complete your booking
        </h1>
        <p className="mt-2 text-charcoal/60">
          {service?.name || professional?.profession || "Home service"}
          {professional ? ` with ${professional.name}` : ""}
        </p>
        <div className="mt-8">
          <BookingWizard
            serviceId={service ? String(service._id) : undefined}
            serviceName={
              service?.name || professional?.profession || "Home Service"
            }
            category={
              service?.category ||
              professional?.category ||
              params.category ||
              "cleaning"
            }
            packageName={packageName}
            addons={addons}
            baseCost={baseCost}
            professionalId={
              professional ? String(professional._id) : undefined
            }
            defaultPhone={user?.phone || session.user.phone || ""}
            defaultAddress={{
              street: defaultAddress.street || "",
              city: defaultAddress.city || "Mumbai",
              pincode: defaultAddress.pincode || "",
              state: defaultAddress.state || "Maharashtra",
            }}
          />
        </div>
      </div>
    </SiteShell>
  );
}
