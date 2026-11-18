"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

type Pkg = {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  durationMins?: number;
  includes?: string[];
};

type Addon = {
  _id?: string;
  name: string;
  price: number;
  description?: string;
};

export function ServiceBookingPanel({
  serviceId,
  slug,
  packages,
  addons,
}: {
  serviceId: string;
  slug: string;
  packages: Pkg[];
  addons: Addon[];
}) {
  const router = useRouter();
  const [pkgName, setPkgName] = useState(packages[0]?.name || "");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const selectedPkg = packages.find((p) => p.name === pkgName) || packages[0];
  const total = useMemo(() => {
    const base = selectedPkg?.price || 0;
    const extras = addons
      .filter((a) => selectedAddons.includes(a.name))
      .reduce((sum, a) => sum + a.price, 0);
    return base + extras;
  }, [selectedPkg, addons, selectedAddons]);

  function toggleAddon(name: string) {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function continueBooking() {
    const params = new URLSearchParams({
      service: slug || serviceId,
      package: pkgName,
      addons: selectedAddons.join(","),
    });
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-charcoal/10 bg-white p-5 shadow-[0_16px_40px_rgba(26,26,26,0.06)]">
      <h3 className="font-display text-xl">Choose a package</h3>
      <div className="mt-4 space-y-3">
        {packages.map((pkg) => (
          <button
            key={pkg.name}
            type="button"
            onClick={() => setPkgName(pkg.name)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              pkgName === pkg.name
                ? "border-pink bg-pink-soft"
                : "border-black/10 hover:border-black/25"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{pkg.name}</div>
                <p className="mt-1 text-xs text-charcoal/55">{pkg.description}</p>
                {pkg.durationMins ? (
                  <p className="mt-1 text-xs text-charcoal/45">
                    ~{pkg.durationMins} mins
                  </p>
                ) : null}
              </div>
              <div className="text-sm font-semibold">{formatINR(pkg.price)}</div>
            </div>
          </button>
        ))}
      </div>

      {addons.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-medium">Add-ons</h4>
          <div className="mt-3 space-y-2">
            {addons.map((addon) => (
              <label
                key={addon.name}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-charcoal/10 px-3 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.name)}
                    onChange={() => toggleAddon(addon.name)}
                    className="accent-[var(--coral)]"
                  />
                  {addon.name}
                </span>
                <span>+{formatINR(addon.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-charcoal/8 pt-4">
        <div>
          <div className="text-xs text-charcoal/50">Estimated total</div>
          <div className="font-display text-2xl">{formatINR(total)}</div>
        </div>
        <Button onClick={continueBooking}>Book now</Button>
      </div>
    </div>
  );
}
