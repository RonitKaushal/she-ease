import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/layout/site-shell";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.type === "admin") redirect("/admin");
  if (session.user.type === "professional") redirect("/pro/dashboard");

  const params = await searchParams;
  await connectDB();

  const [bookings, user] = await Promise.all([
    Booking.find({ user: session.user.id })
      .populate("professional", "name profession rating")
      .sort({ createdAt: -1 })
      .lean(),
    User.findById(session.user.id).lean(),
  ]);

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "completed").length,
    upcoming: bookings.filter((b) =>
      ["pending", "confirmed", "in-progress"].includes(b.status)
    ).length,
    spent: bookings
      .filter((b) => b.payment?.status === "paid" || b.status === "completed")
      .reduce((sum, b) => sum + (b.payment?.total || 0), 0),
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
          Hello, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-2 text-charcoal/60">
          Manage bookings, reviews, and your profile.
        </p>
        <div className="mt-8">
          <CustomerDashboard
            initialTab={params.tab || "overview"}
            bookings={JSON.parse(JSON.stringify(bookings))}
            stats={stats}
            profile={JSON.parse(
              JSON.stringify({
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                addresses: user?.addresses || [],
                notifications: user?.notifications,
              })
            )}
          />
        </div>
      </div>
    </SiteShell>
  );
}
