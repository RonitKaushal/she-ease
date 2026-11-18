"use client";

import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AddressValue = {
  street: string;
  city: string;
  pincode: string;
  state: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export function AddressPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ", India"
          )}&limit=5`,
          { headers: { Accept: "application/json" } }
        );
        const data = (await res.json()) as Suggestion[];
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  function applySuggestion(item: Suggestion) {
    const parts = item.display_name.split(",").map((p) => p.trim());
    const pincode =
      parts.find((p) => /^\d{6}$/.test(p)) || value.pincode || "";
    const city =
      parts.find((p) =>
        ["Mumbai", "Pune", "Delhi", "Bengaluru", "Hyderabad", "Thane"].some(
          (c) => p.includes(c)
        )
      ) ||
      parts[parts.length - 4] ||
      value.city ||
      "Mumbai";

    onChange({
      street: parts.slice(0, 2).join(", "),
      city,
      pincode,
      state: "Maharashtra",
      lat: Number(item.lat),
      lng: Number(item.lon),
    });
    setQuery(item.display_name);
    setSuggestions([]);
  }

  const mapSrc =
    value.lat && value.lng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${
          value.lng - 0.02
        }%2C${value.lat - 0.02}%2C${value.lng + 0.02}%2C${
          value.lat + 0.02
        }&layer=mapnik&marker=${value.lat}%2C${value.lng}`
      : "https://www.openstreetmap.org/export/embed.html?bbox=72.80%2C19.05%2C72.95%2C19.15&layer=mapnik&marker=19.0760%2C72.8777";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Search on map</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-pink" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area, landmark, society..."
          />
        </div>
        {loading && (
          <p className="text-xs text-black/45">Searching locations...</p>
        )}
        {suggestions.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            {suggestions.map((item) => (
              <button
                key={`${item.lat}-${item.lon}`}
                type="button"
                className="flex w-full items-start gap-2 border-b border-black/5 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-pink-soft"
                onClick={() => applySuggestion(item)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink" />
                <span>{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10">
        <iframe
          title="Service location map"
          src={mapSrc}
          className="h-48 w-full"
          loading="lazy"
        />
      </div>

      <div className="space-y-2">
        <Label>Street address</Label>
        <Input
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          placeholder="Flat, building, street"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>City</Label>
          <Input
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Pincode</Label>
          <Input
            value={value.pincode}
            inputMode="numeric"
            maxLength={6}
            onChange={(e) =>
              onChange({
                ...value,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              onChange({
                ...value,
                lat: 19.076,
                lng: 72.8777,
                city: value.city || "Mumbai",
              })
            }
          >
            Use Mumbai center
          </Button>
        </div>
      </div>
    </div>
  );
}
