import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-black text-white pb-20 md:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div>
          <div className="text-lg font-semibold">SheEase</div>
          <p className="mt-2 max-w-sm text-sm text-white/60">
            Book trusted home services in a few taps.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
          <Link href="/services" className="hover:text-pink">
            Services
          </Link>
          <Link href="/professionals" className="hover:text-pink">
            Professionals
          </Link>
          <Link href="/help" className="hover:text-pink">
            Help
          </Link>
          <Link href="/contact" className="hover:text-pink">
            Contact
          </Link>
          <Link href="/about" className="hover:text-pink">
            About
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} SheEase
      </div>
    </footer>
  );
}
