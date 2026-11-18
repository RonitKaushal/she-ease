import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-coral">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl text-charcoal">
          Page not found
        </h1>
        <p className="mt-3 text-charcoal/60">
          That link doesn’t exist. Head back home and book something useful instead.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Back to SheEase</Link>
        </Button>
      </div>
    </SiteShell>
  );
}
