"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddressPicker } from "@/components/maps/address-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { TIME_SLOTS } from "@/lib/constants";
import { calculatePricing } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";

type Props = {
  serviceId?: string;
  serviceName: string;
  category: string;
  packageName: string;
  addons: string[];
  baseCost: number;
  professionalId?: string;
  defaultPhone?: string;
  defaultAddress?: {
    street: string;
    city: string;
    pincode: string;
    state?: string;
  };
};

export function BookingWizard(props: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string>(TIME_SLOTS[2]);
  const [serviceType, setServiceType] = useState<"standard" | "express">(
    "standard"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "upi" | "card" | "cash" | "razorpay"
  >("razorpay");
  const [promoCode, setPromoCode] = useState("");
  const [phone, setPhone] = useState(props.defaultPhone || "");
  const [instructions, setInstructions] = useState("");
  const [address, setAddress] = useState({
    street: props.defaultAddress?.street || "",
    city: props.defaultAddress?.city || "Mumbai",
    pincode: props.defaultAddress?.pincode || "",
    state: props.defaultAddress?.state || "Maharashtra",
    lat: null as number | null,
    lng: null as number | null,
  });

  const pricing = useMemo(
    () =>
      calculatePricing({
        baseCost: props.baseCost,
        serviceType,
        promoCode,
      }),
    [props.baseCost, serviceType, promoCode]
  );

  const progress = (step / 3) * 100;
  const phoneDigits = phone.replace(/\D/g, "");
  const addressReady =
    address.street.trim().length >= 3 &&
    address.city.trim().length >= 2 &&
    /^\d{6}$/.test(address.pincode.trim()) &&
    phoneDigits.length >= 10;

  function validateAddressStep() {
    if (!addressReady) {
      toast.error("Complete address, 6-digit pincode and 10-digit phone");
      return false;
    }
    return true;
  }

  async function payWithRazorpay(bookingId: string) {
    const orderRes = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message || "Payment order failed");

    // Sandbox/demo checkout (no Razorpay script required for local MVP)
    const confirmPay = window.confirm(
      `Pay ${formatINR(pricing.total)} via Razorpay test checkout?\nOrder: ${orderData.order.id}`
    );
    if (!confirmPay) {
      toast.message("You can pay later from My Bookings");
      return;
    }

    const verifyRes = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        razorpayOrderId: orderData.order.id,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.message || "Payment failed");
    toast.success("Payment successful");
  }

  async function submit() {
    if (!date) {
      toast.error("Please select a date");
      setStep(1);
      return;
    }
    if (!validateAddressStep()) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: props.serviceId,
          professionalId: props.professionalId,
          packageName: props.packageName,
          addons: props.addons,
          date,
          time,
          phone: phone.trim(),
          specialInstructions: instructions,
          serviceType,
          paymentMethod,
          promoCode,
          address: {
            street: address.street.trim(),
            city: address.city.trim(),
            pincode: address.pincode.trim(),
            state: address.state?.trim() || "Maharashtra",
            lat: address.lat,
            lng: address.lng,
          },
          serviceName: props.serviceName,
          category: props.category,
          baseCost: props.baseCost,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Booking failed");
        return;
      }

      if (paymentMethod === "razorpay") {
        await payWithRazorpay(data.booking._id);
      } else {
        toast.success("Booking confirmed");
      }

      router.push(`/dashboard?tab=bookings&highlight=${data.booking._id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 sm:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-black/55">
          <span>Step {step} of 3</span>
          <span>{props.serviceName}</span>
        </div>
        <Progress value={progress} />
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`step-dot h-2 flex-1 rounded-full ${
                n <= step ? "bg-pink" : "bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Pick a slot</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <select
                className="h-11 w-full rounded-xl border border-black/12 bg-white px-3 text-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["standard", "express"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setServiceType(type)}
                className={`rounded-xl border p-4 text-left ${
                  serviceType === type
                    ? "border-pink bg-pink-soft"
                    : "border-black/10"
                }`}
              >
                <div className="font-medium capitalize">{type}</div>
                <div className="mt-1 text-xs text-black/50">
                  {type === "express" ? "1.5x priority fee" : "Regular slot"}
                </div>
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={!date} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Where should we come?</h2>
          <AddressPicker value={address} onChange={setAddress} />
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              inputMode="tel"
              placeholder="9876543210"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Instructions (optional)</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Gate code, parking notes, pets..."
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={!addressReady}
              onClick={() => {
                if (validateAddressStep()) setStep(3);
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Confirm & pay</h2>
          <div className="space-y-1.5 rounded-xl bg-sand p-4 text-sm">
            <div className="flex justify-between">
              <span>Package</span>
              <span>{props.packageName || "Standard"}</span>
            </div>
            <div className="flex justify-between">
              <span>Slot</span>
              <span>
                {date} · {time}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base</span>
              <span>{formatINR(pricing.baseCost)}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-pink">
                <span>Discount</span>
                <span>-{formatINR(pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes (18%)</span>
              <span>{formatINR(pricing.taxes)}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-semibold">
              <span>Total</span>
              <span>{formatINR(pricing.total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Promo code</Label>
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="SAVE20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["razorpay", "upi", "card", "cash"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-xl border py-3 text-sm capitalize ${
                  paymentMethod === method
                    ? "border-pink bg-pink-soft"
                    : "border-black/10"
                }`}
              >
                {method === "razorpay" ? "Razorpay" : method}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" disabled={loading} onClick={submit}>
              {loading
                ? "Processing..."
                : paymentMethod === "cash"
                  ? "Book (pay later)"
                  : `Pay ${formatINR(pricing.total)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
