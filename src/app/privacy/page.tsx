import { SiteShell } from "@/components/layout/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl text-charcoal">Privacy Policy</h1>
        <p className="mt-4 text-charcoal/65 leading-relaxed">
          We collect account details, booking information, and service preferences to
          operate SheEase. Payment details in this MVP are simulated and not processed
          by a live gateway. We do not sell personal data. You can request account
          deactivation by contacting support.
        </p>
      </div>
    </SiteShell>
  );
}
