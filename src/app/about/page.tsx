import { SiteShell } from "@/components/layout/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl text-charcoal">About SheEase</h1>
        <p className="mt-4 text-lg leading-relaxed text-charcoal/70">
          SheEase is a home services marketplace built to make booking trusted
          professionals as simple as ordering food. Transparent packages, verified
          pros, and clear status tracking — from cleaning to repairs.
        </p>
        <p className="mt-4 leading-relaxed text-charcoal/65">
          We started with a simple belief: households deserve reliable help without
          phone-tag, surprise pricing, or no-shows. Every booking on SheEase is
          designed around clarity and care.
        </p>
      </div>
    </SiteShell>
  );
}
