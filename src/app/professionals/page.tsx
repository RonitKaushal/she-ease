import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { ProImage } from "@/components/ui/pro-image";
import { CATEGORIES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    city?: string;
    minRating?: string;
    maxPrice?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = { isAvailable: true };
  if (params.category) filter.category = params.category;
  if (params.city) filter.city = { $regex: params.city, $options: "i" };
  if (params.minRating) filter.rating = { $gte: Number(params.minRating) };
  if (params.maxPrice) filter.priceAmount = { $lte: Number(params.maxPrice) };
  if (params.q) {
    filter.$or = [
      { name: { $regex: params.q, $options: "i" } },
      { profession: { $regex: params.q, $options: "i" } },
      { skills: { $regex: params.q, $options: "i" } },
    ];
  }

  const professionals = await Professional.find(filter)
    .sort({ rating: -1, totalReviews: -1 })
    .lean();

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold text-black">Professionals</h1>
        <p className="mt-1 text-sm text-black/55">
          Verified experts you can book directly.
        </p>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          <Link href="/professionals" className="shrink-0">
            <Badge variant={!params.category ? "default" : "outline"}>All</Badge>
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/professionals?category=${c.id}`} className="shrink-0">
              <Badge variant={params.category === c.id ? "default" : "outline"}>
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/professionals?minRating=4.5">
            <Badge variant={params.minRating === "4.5" ? "default" : "outline"}>
              4.5+ rating
            </Badge>
          </Link>
          <Link href="/professionals?maxPrice=600">
            <Badge variant={params.maxPrice === "600" ? "default" : "outline"}>
              Under ₹600
            </Badge>
          </Link>
          <Link href="/professionals?city=Mumbai">
            <Badge variant={params.city === "Mumbai" ? "default" : "outline"}>
              Mumbai
            </Badge>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro) => (
            <Link
              key={String(pro._id)}
              href={`/professionals/${pro._id}`}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:border-pink"
            >
              <ProImage
                src={pro.avatar}
                alt={pro.name}
                seed={pro.name}
                className="aspect-[4/3] w-full"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-black">{pro.name}</div>
                    <div className="text-sm text-black/55">{pro.profession}</div>
                  </div>
                  {pro.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-black/60">
                    ★ {pro.rating} ({pro.totalReviews})
                  </span>
                  <span className="font-medium">{formatINR(pro.priceAmount)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
