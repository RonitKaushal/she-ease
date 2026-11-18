import { SiteShell } from "@/components/layout/site-shell";

export default function TermsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose-none">
        <h1 className="font-display text-4xl text-charcoal">Terms of Service</h1>
        <p className="mt-4 text-charcoal/65 leading-relaxed">
          By using SheEase you agree to book services in good faith, provide accurate
          address and contact details, and treat professionals respectfully. Prices
          shown before checkout include applicable taxes unless stated otherwise.
          Cancellations should be made as early as possible. SheEase is a marketplace
          connecting customers and independent professionals.
        </p>
      </div>
    </SiteShell>
  );
}
