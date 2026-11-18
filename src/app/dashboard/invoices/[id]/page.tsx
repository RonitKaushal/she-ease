import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/layout/site-shell";
import { InvoiceActions } from "@/components/dashboard/invoice-actions";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  await connectDB();
  const booking = await Booking.findById(id)
    .populate("professional", "name profession")
    .lean();

  if (!booking) notFound();
  if (
    booking.user.toString() !== session.user.id &&
    session.user.type !== "admin"
  ) {
    redirect("/dashboard");
  }

  const professional = booking.professional as
    | { name?: string; profession?: string }
    | null
    | undefined;

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/dashboard?tab=bookings" className="text-sm text-pink">
            ← Back to bookings
          </Link>
          <InvoiceActions
            bookingId={booking.bookingId || ""}
            serviceName={booking.service?.name || "Service"}
            total={booking.payment?.total || 0}
            date={booking.date}
          />
        </div>

        <div
          id="invoice-print"
          className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">SheEase Invoice</div>
              <div className="mt-1 text-sm text-black/55">{booking.bookingId}</div>
            </div>
            <div className="text-right text-sm text-black/55">
              <div>{booking.date}</div>
              <div>{booking.time}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40">
                Billed to
              </div>
              <div className="mt-1 font-medium">{session.user.name}</div>
              <div className="text-sm text-black/55">{booking.phone}</div>
              <div className="mt-1 text-sm text-black/55">
                {booking.address?.full || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40">
                Provider
              </div>
              <div className="mt-1 font-medium">
                {professional?.name || "Assigned professional"}
              </div>
              <div className="text-sm text-black/55">
                {professional?.profession || booking.service?.category || "—"}
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10">
            <div className="grid grid-cols-3 bg-sand px-4 py-2 text-xs font-medium uppercase tracking-wide text-black/50">
              <span>Service</span>
              <span>Details</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-3 text-sm">
              <span>{booking.service?.name || "Service"}</span>
              <span className="text-black/55">
                {booking.service?.packageName || "Standard"}
              </span>
              <span className="text-right">
                {formatINR(booking.payment?.baseCost || 0)}
              </span>
            </div>
            {(booking.payment?.discount || 0) > 0 && (
              <div className="grid grid-cols-3 border-t border-black/5 px-4 py-3 text-sm">
                <span>Discount</span>
                <span />
                <span className="text-right text-pink">
                  -{formatINR(booking.payment?.discount || 0)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 border-t border-black/5 px-4 py-3 text-sm">
              <span>Taxes</span>
              <span />
              <span className="text-right">
                {formatINR(booking.payment?.taxes || 0)}
              </span>
            </div>
            <div className="grid grid-cols-3 border-t border-black/10 bg-sand/50 px-4 py-3 text-sm font-semibold">
              <span>Total</span>
              <span className="capitalize">{booking.payment?.status}</span>
              <span className="text-right">
                {formatINR(booking.payment?.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
