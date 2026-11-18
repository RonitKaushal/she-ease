import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { ServiceBookingPanel } from "@/components/services/service-booking-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceImage } from "@/components/ui/service-image";
import { connectDB } from "@/lib/db";
import { resolveServiceImage } from "@/lib/images";
import { Professional } from "@/models/Professional";
import { Service } from "@/models/Service";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const service = await Service.findOne({ slug, isActive: true }).lean();
  if (!service) notFound();

  const pros = await Professional.find({
    category: service.category,
    isAvailable: true,
  })
    .sort({ rating: -1 })
    .limit(4)
    .lean();

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <ServiceImage
            src={resolveServiceImage(service.image, service.category)}
            alt={service.name}
            className="h-64 rounded-[1.75rem] sm:h-80"
            imageClassName="rounded-[1.75rem]"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />

          <div className="mt-6">
            <Badge>{service.category}</Badge>
            <h1 className="mt-3 font-display text-3xl text-black sm:text-4xl">
              {service.name}
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-black/65">
              {service.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-black/60">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-pink text-pink" />
                {Number(service.rating || 4.7).toFixed(1)} rating
              </span>
              <span>From {formatINR(service.startingPrice)}</span>
              <span>{service.totalBookings || 0}+ bookings</span>
            </div>
          </div>

          {service.features?.length ? (
            <div className="mt-8">
              <h2 className="font-display text-2xl text-black">What’s included</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {service.features.map((f) => (
                  <li
                    key={f}
                    className="rounded-xl border border-black/10 bg-sand/50 px-4 py-3 text-sm text-black/80"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {service.faqs?.length ? (
            <div className="mt-8">
              <h2 className="font-display text-2xl text-black">FAQs</h2>
              <div className="mt-3 space-y-3">
                {service.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-black/10 bg-white p-4"
                  >
                    <div className="font-medium text-black">{faq.question}</div>
                    <p className="mt-1 text-sm text-black/60">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-black">Top pros nearby</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={`/professionals?category=${service.category}`}>
                  View all
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pros.map((pro) => (
                <Link
                  key={String(pro._id)}
                  href={`/professionals/${pro._id}`}
                  className="rounded-2xl border border-black/10 bg-sand/40 p-4 transition hover:border-pink"
                >
                  <div className="font-medium text-black">{pro.name}</div>
                  <div className="text-sm text-black/55">{pro.profession}</div>
                  <div className="mt-2 text-xs text-black/50">
                    ★ {pro.rating} · {pro.totalReviews} reviews ·{" "}
                    {formatINR(pro.priceAmount)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ServiceBookingPanel
          serviceId={String(service._id)}
          slug={service.slug}
          packages={JSON.parse(JSON.stringify(service.packages || []))}
          addons={JSON.parse(JSON.stringify(service.addons || []))}
        />
      </div>
    </SiteShell>
  );
}
