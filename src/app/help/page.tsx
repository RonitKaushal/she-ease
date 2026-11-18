import { SiteShell } from "@/components/layout/site-shell";

const FAQS = [
  {
    q: "How do I book a service?",
    a: "Choose a category, pick a package and add-ons, select a slot, enter your address, and confirm payment.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Open Dashboard → Bookings and cancel any pending, confirmed, or in-progress job.",
  },
  {
    q: "What promo codes work?",
    a: "Try SAVE20, FIRST50, or SHEEASE10 at checkout.",
  },
  {
    q: "How do professionals get paid?",
    a: "Cash jobs settle on completion. UPI/card bookings are marked paid at checkout in this MVP (mock payments).",
  },
];

export default function HelpPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl text-charcoal">Help Center</h1>
        <div className="mt-8 space-y-4">
          {FAQS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-charcoal/8 bg-cream p-5"
            >
              <h2 className="font-medium text-charcoal">{item.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
