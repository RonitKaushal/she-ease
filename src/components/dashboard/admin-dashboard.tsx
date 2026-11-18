"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProImage } from "@/components/ui/pro-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

type Pro = {
  _id: string;
  name: string;
  email: string;
  category: string;
  avatar?: string | null;
  verificationStatus?: string;
  verified?: boolean;
  documents?: { idProof?: string; addressProof?: string; certification?: string };
};

type ServiceItem = {
  _id: string;
  name: string;
  category: string;
  startingPrice: number;
  popular?: boolean;
  isActive?: boolean;
};

type BookingItem = {
  _id: string;
  bookingId: string;
  status: string;
  service: { name: string };
  payment?: { total?: number; status?: string };
  user?: { name?: string };
  professional?: { name?: string };
};

type DisputeItem = {
  _id: string;
  subject: string;
  description: string;
  status: string;
  resolution?: string;
  raisedBy?: { name?: string };
};

export function AdminDashboard({
  stats,
  professionals: initialPros,
  services: initialServices,
  bookings,
  disputes: initialDisputes,
}: {
  stats: Record<string, number>;
  professionals: Pro[];
  services: ServiceItem[];
  bookings: BookingItem[];
  disputes: DisputeItem[];
}) {
  const [professionals, setProfessionals] = useState(initialPros);
  const [services, setServices] = useState(initialServices);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [newService, setNewService] = useState({
    name: "",
    category: "cleaning",
    startingPrice: 499,
    description: "",
  });

  async function verifyPro(id: string, verificationStatus: "approved" | "rejected") {
    const res = await fetch("/api/admin/professionals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        verificationStatus,
        verificationNote:
          verificationStatus === "rejected" ? "Documents incomplete" : "Approved",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Failed");
      return;
    }
    setProfessionals((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...data.professional } : p))
    );
    toast.success(`Provider ${verificationStatus}`);
  }

  async function createService() {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Failed");
      return;
    }
    setServices((prev) => [...prev, data.service]);
    setNewService({
      name: "",
      category: "cleaning",
      startingPrice: 499,
      description: "",
    });
    toast.success("Service created");
  }

  async function resolveDispute(id: string, status: "resolved" | "rejected") {
    const res = await fetch("/api/disputes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        resolution:
          status === "resolved"
            ? "Resolved by admin after review"
            : "Rejected after review",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Failed");
      return;
    }
    setDisputes((prev) =>
      prev.map((d) => (d._id === id ? { ...d, ...data.dispute } : d))
    );
    toast.success("Dispute updated");
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="providers">Providers</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="disputes">Disputes</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Customers", value: stats.users },
            { label: "Professionals", value: stats.professionals },
            { label: "Pending verifications", value: stats.pendingPros },
            { label: "Services", value: stats.services },
            { label: "Recent bookings", value: stats.bookings },
            { label: "Revenue", value: formatINR(stats.revenue) },
            { label: "Open disputes", value: stats.openDisputes },
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
      </TabsContent>

      <TabsContent value="providers" className="space-y-3">
        {professionals.map((pro) => (
          <div
            key={pro._id}
            className="rounded-2xl border border-black/10 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ProImage
                  src={pro.avatar}
                  alt={pro.name}
                  seed={pro.name}
                  className="h-12 w-12 shrink-0"
                  rounded="full"
                  sizes="48px"
                />
                <div>
                <div className="font-semibold">{pro.name}</div>
                <div className="text-sm text-black/55">
                  {pro.email} · {pro.category}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {pro.documents?.idProof && (
                    <a className="text-pink underline" href={pro.documents.idProof} target="_blank">
                      ID proof
                    </a>
                  )}
                  {pro.documents?.addressProof && (
                    <a className="text-pink underline" href={pro.documents.addressProof} target="_blank">
                      Address
                    </a>
                  )}
                  {pro.documents?.certification && (
                    <a className="text-pink underline" href={pro.documents.certification} target="_blank">
                      Certificate
                    </a>
                  )}
                </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{pro.verificationStatus || "pending"}</Badge>
                <Button size="sm" onClick={() => verifyPro(pro._id, "approved")}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => verifyPro(pro._id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
          <h3 className="font-semibold">Create service</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Service name"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
            />
            <select
              className="h-11 rounded-xl border border-black/12 px-3 text-sm"
              value={newService.category}
              onChange={(e) =>
                setNewService({ ...newService, category: e.target.value })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              value={newService.startingPrice}
              onChange={(e) =>
                setNewService({
                  ...newService,
                  startingPrice: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Description"
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
            />
          </div>
          <Button onClick={createService}>Add service</Button>
        </div>
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-black/55">
                  {s.category} · from {formatINR(s.startingPrice)}
                </div>
              </div>
              {s.popular && <Badge>Popular</Badge>}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="rounded-2xl border border-black/10 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-black/45">{b.bookingId}</div>
                <div className="font-medium">{b.service.name}</div>
                <div className="text-sm text-black/55">
                  {b.user?.name || "Customer"} · {b.professional?.name || "Unassigned"}
                </div>
              </div>
              <div className="text-right">
                <Badge>{b.status}</Badge>
                <div className="mt-1 text-sm">
                  {formatINR(b.payment?.total || 0)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="disputes" className="space-y-3">
        {disputes.map((d) => (
          <div
            key={d._id}
            className="rounded-2xl border border-black/10 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">{d.subject}</div>
                <div className="mt-1 text-sm text-black/55">{d.description}</div>
                <div className="mt-1 text-xs text-black/45">
                  By {d.raisedBy?.name || "User"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{d.status}</Badge>
                {["open", "in-review"].includes(d.status) && (
                  <>
                    <Button size="sm" onClick={() => resolveDispute(d._id, "resolved")}>
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveDispute(d._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {!disputes.length && (
          <p className="text-sm text-black/50">No disputes yet.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
