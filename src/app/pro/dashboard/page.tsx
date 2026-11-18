import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/layout/site-shell";
import { ProDashboard } from "@/components/dashboard/pro-dashboard";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getProfessionalForUser } from "@/lib/session";
import { Booking } from "@/models/Booking";

export const dynamic = "force-dynamic";

export default async function ProDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/pro/dashboard");
  if (session.user.type !== "professional" && session.user.type !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();
  const professional = await getProfessionalForUser(session.user.id);
  if (!professional) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl">Professional profile missing</h1>
          <p className="mt-2 text-charcoal/60">
            Re-register as a professional or contact support.
          </p>
        </div>
      </SiteShell>
    );
  }

  const bookings = await Booking.find({ professional: professional._id })
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
          Pro dashboard
        </h1>
        <p className="mt-2 text-charcoal/60">
          Manage jobs, availability, and your public profile.
        </p>
        <div className="mt-8">
          <ProDashboard
            bookings={JSON.parse(JSON.stringify(bookings))}
            stats={{
              rating: professional.rating,
              totalReviews: professional.totalReviews,
              completedBookings: professional.completedBookings,
              earnings: professional.earnings,
              isAvailable: professional.isAvailable,
              verificationStatus: professional.verificationStatus,
            }}
            profile={JSON.parse(
              JSON.stringify({
                profession: professional.profession,
                description: professional.description,
                bio: professional.bio,
                priceAmount: professional.priceAmount,
                isAvailable: professional.isAvailable,
                skills: professional.skills,
                experience: professional.experience,
                location: professional.location,
                city: professional.city,
                phone: professional.phone,
                verificationStatus: professional.verificationStatus,
                documents: professional.documents,
                workingHours: professional.workingHours,
              })
            )}
          />
        </div>
      </div>
    </SiteShell>
  );
}
