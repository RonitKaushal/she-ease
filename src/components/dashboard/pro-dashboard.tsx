"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/utils";

type Booking = {
  _id: string;
  bookingId: string;
  service: { name: string; packageName?: string };
  date: string;
  time: string;
  status: string;
  address: { full: string };
  phone: string;
  payment: { total: number };
  user?: { name?: string; phone?: string };
};

type ProProfile = {
  profession: string;
  description: string;
  bio: string;
  priceAmount: number;
  isAvailable: boolean;
  skills: string[];
  experience: string;
  location: string;
  city: string;
  phone: string;
  verificationStatus?: string;
  documents?: {
    idProof?: string;
    addressProof?: string;
    certification?: string;
  };
  workingHours?: {
    start?: string;
    end?: string;
    days?: string[];
  };
};

type Payout = {
  _id: string;
  amount: number;
  status: string;
  note?: string;
  paidAt?: string;
  createdAt?: string;
};

export function ProDashboard({
  bookings: initialBookings,
  stats,
  profile: initialProfile,
}: {
  bookings: Booking[];
  stats: {
    rating: number;
    totalReviews: number;
    completedBookings: number;
    earnings: number;
    isAvailable: boolean;
    verificationStatus?: string;
  };
  profile: ProProfile;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [profile, setProfile] = useState(initialProfile);
  const [skillsText, setSkillsText] = useState(
    initialProfile.skills?.join(", ") || ""
  );
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hours, setHours] = useState({
    start: initialProfile.workingHours?.start || "09:00",
    end: initialProfile.workingHours?.end || "18:00",
    days: (initialProfile.workingHours?.days || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]).join(", "),
  });

  useEffect(() => {
    fetch("/api/payouts")
      .then((r) => r.json())
      .then((d) => setPayouts(d.payouts || []))
      .catch(() => undefined);
  }, []);

  async function updateStatus(
    id: string,
    status: "confirmed" | "en-route" | "in-progress" | "completed" | "cancelled"
  ) {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Update failed");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status: data.booking.status } : b))
    );
    toast.success(`Marked ${status}`);
  }

  async function uploadDoc(kind: "idProof" | "addressProof" | "certification", file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "documents");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      toast.error(data.message || "Upload failed");
      return;
    }
    const documents = {
      ...(profile.documents || {}),
      [kind]: data.url,
    };
    setProfile({ ...profile, documents });
    toast.success("Document uploaded — save profile to submit for verification");
  }

  async function saveProfile() {
    const res = await fetch("/api/professionals/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profile,
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        workingHours: {
          start: hours.start,
          end: hours.end,
          days: hours.days
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
        },
        documents: profile.documents,
      }),
    });
    if (!res.ok) {
      toast.error("Could not save profile");
      return;
    }
    toast.success("Profile saved");
  }

  return (
    <Tabs defaultValue="jobs">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="payouts">Payouts</TabsTrigger>
        <TabsTrigger value="profile">Profile & docs</TabsTrigger>
      </TabsList>

      <TabsContent value="jobs">
        <div className="mb-4 text-sm text-black/55">
          Verification:{" "}
          <Badge>{stats.verificationStatus || profile.verificationStatus || "pending"}</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Rating", value: stats.rating },
            { label: "Reviews", value: stats.totalReviews },
            { label: "Completed", value: stats.completedBookings },
            { label: "Earnings", value: formatINR(stats.earnings) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-black/10 bg-sand/40 p-5"
            >
              <div className="text-sm text-black/55">{item.label}</div>
              <div className="mt-2 font-display text-3xl">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-black/45">{b.bookingId}</div>
                  <div className="font-display text-xl">{b.service.name}</div>
                  <div className="mt-1 text-sm text-black/55">
                    {b.date} · {b.time} · {b.user?.name || "Customer"}
                  </div>
                  <div className="mt-1 text-sm text-black/50">{b.address.full}</div>
                </div>
                <div className="text-right">
                  <Badge>{b.status}</Badge>
                  <div className="mt-2 font-medium">
                    {formatINR(b.payment.total)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.status === "pending" && (
                  <Button size="sm" onClick={() => updateStatus(b._id, "confirmed")}>
                    Accept
                  </Button>
                )}
                {b.status === "confirmed" && (
                  <Button size="sm" onClick={() => updateStatus(b._id, "en-route")}>
                    En route
                  </Button>
                )}
                {b.status === "en-route" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(b._id, "in-progress")}
                  >
                    Start job
                  </Button>
                )}
                {b.status === "in-progress" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(b._id, "completed")}
                  >
                    Mark complete
                  </Button>
                )}
                {["pending", "confirmed"].includes(b.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(b._id, "cancelled")}
                  >
                    Decline
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!bookings.length && (
            <p className="text-sm text-black/50">No jobs yet.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="payouts" className="space-y-3">
        {payouts.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4"
          >
            <div>
              <div className="font-medium">{formatINR(p.amount)}</div>
              <div className="text-sm text-black/55">{p.note || "Payout"}</div>
            </div>
            <Badge>{p.status}</Badge>
          </div>
        ))}
        {!payouts.length && (
          <p className="text-sm text-black/50">
            Payouts appear after you complete jobs.
          </p>
        )}
      </TabsContent>

      <TabsContent value="profile">
        <div className="max-w-xl space-y-4 rounded-2xl border border-black/10 bg-white p-5">
          <div className="space-y-2">
            <Label>Profession</Label>
            <Input
              value={profile.profession}
              onChange={(e) =>
                setProfile({ ...profile, profession: e.target.value })
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price / visit</Label>
              <Input
                type="number"
                value={profile.priceAmount}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    priceAmount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Work start</Label>
              <Input
                value={hours.start}
                onChange={(e) => setHours({ ...hours, start: e.target.value })}
                placeholder="09:00"
              />
            </div>
            <div className="space-y-2">
              <Label>Work end</Label>
              <Input
                value={hours.end}
                onChange={(e) => setHours({ ...hours, end: e.target.value })}
                placeholder="18:00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Working days</Label>
            <Input
              value={hours.days}
              onChange={(e) => setHours({ ...hours, days: e.target.value })}
              placeholder="Mon, Tue, Wed, Thu, Fri, Sat"
            />
          </div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="space-y-3 rounded-xl bg-sand p-4">
            <div className="font-medium">Documents for verification</div>
            {(
              [
                ["idProof", "ID proof"],
                ["addressProof", "Address proof"],
                ["certification", "Certification"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDoc(key, file);
                  }}
                />
                {profile.documents?.[key] && (
                  <a
                    href={profile.documents[key]}
                    target="_blank"
                    className="text-xs text-pink underline"
                  >
                    View uploaded
                  </a>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.isAvailable}
              onChange={(e) =>
                setProfile({ ...profile, isAvailable: e.target.checked })
              }
              className="accent-[var(--pink)]"
            />
            Available for new bookings
          </label>
          <Button onClick={saveProfile} disabled={uploading}>
            Save profile
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
