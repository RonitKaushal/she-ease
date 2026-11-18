import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { ServiceImage } from "@/components/ui/service-image";
import { CATEGORIES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { resolveServiceImage } from "@/lib/images";
import { Service } from "@/models/Service";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>;
}) {
  const params = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };
  if (params.category) filter.category = params.category;
  if (params.q) {
    filter.$or = [
      { name: { $regex: params.q, $options: "i" } },
      { description: { $regex: params.q, $options: "i" } },
      { category: { $regex: params.q, $options: "i" } },
    ];
  }

  const services = await Service.find(filter).sort({ popular: -1, name: 1 }).lean();
  const activeCategory = CATEGORIES.find((c) => c.id === params.category);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-black/10 bg-sand/50 px-5 py-6 sm:px-7">
          <h1 className="font-display text-3xl text-black sm:text-4xl">
            {activeCategory ? activeCategory.name : "All services"}
          </h1>
          <p className="mt-2 text-sm text-black/55">
            {params.q
              ? `Results for “${params.q}”`
              : "Choose a service, pick a package, book a slot."}
          </p>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          <Link href="/services" className="shrink-0">
            <Badge variant={!params.category ? "default" : "outline"}>All</Badge>
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/services?category=${c.id}`} className="shrink-0">
              <Badge variant={params.category === c.id ? "default" : "outline"}>
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={String(service._id)}
              href={`/services/${service.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:border-pink/50 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
            >
              <ServiceImage
                src={resolveServiceImage(service.image, service.category)}
                alt={service.name}
                className="h-44"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pink">
                    {service.category}
                  </span>
                  {service.popular && <Badge>Popular</Badge>}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-black">
                  {service.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-black/55">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-black">
                    From {formatINR(service.startingPrice)}
                  </span>
                  <span className="text-sm font-medium text-pink opacity-0 transition group-hover:opacity-100">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!services.length && (
          <p className="mt-10 text-black/50">No services found. Try another category.</p>
        )}
      </div>
    </SiteShell>
  );
}
