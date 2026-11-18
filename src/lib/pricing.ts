import { PROMO_CODES, TAX_RATE } from "@/lib/constants";

export function calculatePricing(input: {
  baseCost: number;
  serviceType?: "standard" | "express";
  promoCode?: string;
}) {
  let baseCost = input.baseCost;
  if (input.serviceType === "express") {
    baseCost = Math.round(baseCost * 1.5);
  }

  const code = (input.promoCode || "").trim().toUpperCase();
  const rate = PROMO_CODES[code] || 0;
  const discount = Math.round(baseCost * rate);
  const taxable = baseCost - discount;
  const taxes = Math.round(taxable * TAX_RATE);
  const total = taxable + taxes;

  return {
    baseCost,
    discount,
    taxes,
    total,
    promoCode: rate ? code : "",
  };
}
