import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProImage } from "@/components/ui/pro-image";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";
import { Review } from "@/models/Review";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const professional = await Professional.findById(id).lean();
  if (!professional) notFound();

  const reviews = await Review.find({
    professional: id,
    isApproved: true,
  })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-[1.75rem] border border-charcoal/8 bg-cream p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5 sm:gap-6">
            <ProImage
              src={professional.avatar}
              alt={professional.name}
              seed={professional.name}
              className="h-28 w-28 shrink-0 sm:h-36 sm:w-36"
              rounded="full"
              sizes="144px"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-3xl sm:text-4xl">
                      {professional.name}
                    </h1>
                    {professional.verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-charcoal/60">{professional.profession}</p>
                  <p className="mt-1 text-sm text-charcoal/50">
                    {professional.location} · {professional.experience}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl">
                    {formatINR(professional.priceAmount)}
                  </div>
                  <div className="text-sm text-charcoal/50">per visit</div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-charcoal/70 leading-relaxed">
            {professional.bio || professional.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {professional.skills?.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-charcoal/60">
            <span>★ {professional.rating} rating</span>
            <span>{professional.totalReviews} reviews</span>
            <span>{professional.completedBookings} jobs done</span>
          </div>

          <Button asChild className="mt-8">
            <Link
              href={`/booking?professional=${professional._id}&category=${professional.category}`}
            >
              Book {professional.name.split(" ")[0]}
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl">Reviews</h2>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div
                key={String(review._id)}
                className="rounded-2xl border border-charcoal/8 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    {(review.user as { name?: string })?.name || "Customer"}
                  </div>
                  <div className="text-sm">★ {review.rating}</div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-charcoal/65">{review.comment}</p>
                )}
              </div>
            ))}
            {!reviews.length && (
              <p className="text-sm text-charcoal/50">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
