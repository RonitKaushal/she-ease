import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/layout/site-shell";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Dispute } from "@/models/Dispute";
import { Professional } from "@/models/Professional";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.type !== "admin") redirect("/dashboard");

  await connectDB();
  const [users, professionals, services, bookings, disputes, revenue] =
    await Promise.all([
      User.countDocuments({ type: "user" }),
      Professional.find().sort({ createdAt: -1 }).lean(),
      Service.find().sort({ name: 1 }).lean(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("user", "name email")
        .populate("professional", "name")
        .lean(),
      Dispute.find()
        .sort({ createdAt: -1 })
        .populate("raisedBy", "name email")
        .populate("booking")
        .lean(),
      Booking.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$payment.total" } } },
      ]),
    ]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-black sm:text-4xl">
          Admin console
        </h1>
        <p className="mt-2 text-black/60">
          Verify providers, manage catalog, bookings, disputes and revenue.
        </p>
        <div className="mt-8">
          <AdminDashboard
            stats={{
              users,
              professionals: professionals.length,
              pendingPros: professionals.filter(
                (p) => p.verificationStatus === "pending"
              ).length,
              services: services.length,
              bookings: bookings.length,
              revenue: revenue[0]?.total || 0,
              openDisputes: disputes.filter((d) =>
                ["open", "in-review"].includes(d.status)
              ).length,
            }}
            professionals={JSON.parse(JSON.stringify(professionals))}
            services={JSON.parse(JSON.stringify(services))}
            bookings={JSON.parse(JSON.stringify(bookings))}
            disputes={JSON.parse(JSON.stringify(disputes))}
          />
        </div>
      </div>
    </SiteShell>
  );
}
