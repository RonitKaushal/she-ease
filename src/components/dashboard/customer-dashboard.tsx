"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TIME_SLOTS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

type Booking = {
  _id: string;
  bookingId: string;
  service: { name: string; category: string; packageName?: string };
  date: string;
  time: string;
  status: string;
  isReviewed: boolean;
  address: { full: string };
  payment: { total: number; method: string; status: string };
  professional?: { name?: string; profession?: string } | null;
  statusHistory?: { status: string; at: string; note?: string }[];
};

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  addresses?: {
    label?: string;
    street: string;
    city: string;
    pincode: string;
    state?: string;
    isDefault?: boolean;
  }[];
  notifications?: {
    email: boolean;
    sms: boolean;
    bookingReminders: boolean;
  };
};

export function CustomerDashboard({
  initialTab,
  bookings: initialBookings,
  stats,
  profile: initialProfile,
}: {
  initialTab?: string;
  bookings: Booking[];
  stats: { total: number; completed: number; upcoming: number; spent: number };
  profile: UserProfile;
}) {
  const [tab, setTab] = useState(initialTab || "overview");
  const [bookings, setBookings] = useState(initialBookings);
  const [profile, setProfile] = useState(initialProfile);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState<string>(TIME_SLOTS[2]);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeSubject, setDisputeSubject] = useState("");
  const [disputeBody, setDisputeBody] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const upcoming = useMemo(
    () =>
      bookings.filter((b) =>
        ["pending", "confirmed", "en-route", "in-progress"].includes(b.status)
      ),
    [bookings]
  );

  async function cancelBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled by customer" }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Could not cancel");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...data.booking } : b))
    );
    toast.success("Booking cancelled");
  }

  async function rescheduleBooking() {
    if (!rescheduleId || !rescheduleDate) {
      toast.error("Pick a new date");
      return;
    }
    const res = await fetch(`/api/bookings/${rescheduleId}/reschedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Could not reschedule");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b._id === rescheduleId ? { ...b, ...data.booking } : b))
    );
    setRescheduleId(null);
    toast.success("Booking rescheduled");
  }

  async function raiseDispute() {
    if (!disputeBookingId) return;
    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: disputeBookingId,
        subject: disputeSubject,
        description: disputeBody,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Could not raise dispute");
      return;
    }
    setDisputeBookingId(null);
    setDisputeSubject("");
    setDisputeBody("");
    toast.success("Dispute submitted to admin");
  }

  async function payNow(bookingId: string) {
    const orderRes = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      toast.error(orderData.message || "Payment failed");
      return;
    }
    const ok = window.confirm(`Pay via Razorpay test for order ${orderData.order.id}?`);
    if (!ok) return;
    const verifyRes = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        razorpayOrderId: orderData.order.id,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      toast.error(verifyData.message || "Verify failed");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, ...verifyData.booking } : b))
    );
    toast.success("Payment successful");
  }

  async function submitReview() {
    if (!reviewBookingId) return;
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: reviewBookingId,
        rating,
        comment,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Review failed");
      return;
    }
    setBookings((prev) =>
      prev.map((b) =>
        b._id === reviewBookingId ? { ...b, isReviewed: true } : b
      )
    );
    setReviewBookingId(null);
    setComment("");
    toast.success("Thanks for your review");
  }

  async function saveProfile() {
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        phone: profile.phone,
        addresses: profile.addresses,
        notifications: profile.notifications,
      }),
    });
    if (!res.ok) {
      toast.error("Could not save profile");
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total bookings", value: stats.total },
            { label: "Upcoming", value: stats.upcoming },
            { label: "Completed", value: stats.completed },
            { label: "Spent", value: formatINR(stats.spent) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-charcoal/8 bg-cream p-5"
            >
              <div className="text-sm text-charcoal/55">{item.label}</div>
              <div className="mt-2 font-display text-3xl">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h2 className="font-display text-2xl">Upcoming</h2>
          <div className="mt-4 space-y-3">
            {upcoming.slice(0, 3).map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-charcoal/8 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{b.service.name}</div>
                    <div className="text-sm text-charcoal/55">
                      {b.date} · {b.time}
                    </div>
                  </div>
                  <Badge>{b.status}</Badge>
                </div>
              </div>
            ))}
            {!upcoming.length && (
              <p className="text-sm text-charcoal/50">No upcoming bookings.</p>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bookings">
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-charcoal/8 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-charcoal/45">{b.bookingId}</div>
                  <div className="font-display text-xl">{b.service.name}</div>
                  <div className="mt-1 text-sm text-charcoal/55">
                    {b.date} · {b.time}
                    {b.professional?.name ? ` · ${b.professional.name}` : ""}
                  </div>
                  <div className="mt-1 text-sm text-charcoal/50">
                    {b.address.full}
                  </div>
                </div>
                <div className="text-right">
                  <Badge>{b.status}</Badge>
                  <div className="mt-2 font-medium">
                    {formatINR(b.payment.total)}
                  </div>
                </div>
              </div>

              {b.statusHistory?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.statusHistory.map((s, idx) => (
                    <span
                      key={`${s.status}-${idx}`}
                      className="rounded-full bg-sand px-2.5 py-1 text-xs capitalize text-charcoal/65"
                    >
                      {s.status}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {["pending", "confirmed", "en-route", "in-progress"].includes(
                  b.status
                ) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelBooking(b._id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleId(b._id);
                        setRescheduleDate(b.date);
                        setRescheduleTime(b.time);
                      }}
                    >
                      Reschedule
                    </Button>
                  </>
                )}
                {b.payment?.status !== "paid" && b.status !== "cancelled" && (
                  <Button size="sm" onClick={() => payNow(b._id)}>
                    Pay now
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/dashboard/invoices/${b._id}`}>Invoice</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDisputeBookingId(b._id)}
                >
                  Raise dispute
                </Button>
                {b.status === "completed" && !b.isReviewed && (
                  <Button size="sm" onClick={() => setReviewBookingId(b._id)}>
                    Leave review
                  </Button>
                )}
              </div>

              {rescheduleId === b._id && (
                <div className="mt-4 space-y-3 rounded-xl bg-sand p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                    <select
                      className="h-11 rounded-xl border border-black/12 bg-white px-3 text-sm"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={rescheduleBooking}>
                    Save new slot
                  </Button>
                </div>
              )}

              {disputeBookingId === b._id && (
                <div className="mt-4 space-y-3 rounded-xl bg-sand p-4">
                  <Input
                    placeholder="Subject"
                    value={disputeSubject}
                    onChange={(e) => setDisputeSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe the issue"
                    value={disputeBody}
                    onChange={(e) => setDisputeBody(e.target.value)}
                  />
                  <Button size="sm" onClick={raiseDispute}>
                    Submit dispute
                  </Button>
                </div>
              )}

              {reviewBookingId === b._id && (
                <div className="mt-4 space-y-3 rounded-xl bg-sand p-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <select
                      className="h-10 w-full rounded-xl border border-charcoal/12 bg-white px-3 text-sm"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the service?"
                  />
                  <Button size="sm" onClick={submitReview}>
                    Submit review
                  </Button>
                </div>
              )}
            </div>
          ))}
          {!bookings.length && (
            <p className="text-sm text-charcoal/50">No bookings yet.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="profile">
        <div className="max-w-xl space-y-4 rounded-2xl border border-charcoal/8 bg-white p-5">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Default address</Label>
            <Input
              value={profile.addresses?.[0]?.street || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  addresses: [
                    {
                      label: "Home",
                      street: e.target.value,
                      city: profile.addresses?.[0]?.city || "Mumbai",
                      pincode: profile.addresses?.[0]?.pincode || "",
                      state: "Maharashtra",
                      isDefault: true,
                    },
                  ],
                })
              }
              placeholder="Street"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={profile.addresses?.[0]?.city || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    addresses: [
                      {
                        ...(profile.addresses?.[0] || {
                          street: "",
                          pincode: "",
                          isDefault: true,
                        }),
                        city: e.target.value,
                        label: "Home",
                        state: "Maharashtra",
                      },
                    ],
                  })
                }
                placeholder="City"
              />
              <Input
                value={profile.addresses?.[0]?.pincode || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    addresses: [
                      {
                        ...(profile.addresses?.[0] || {
                          street: "",
                          city: "Mumbai",
                          isDefault: true,
                        }),
                        pincode: e.target.value,
                        label: "Home",
                        state: "Maharashtra",
                      },
                    ],
                  })
                }
                placeholder="Pincode"
              />
            </div>
          </div>
          <Button onClick={saveProfile}>Save profile</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
