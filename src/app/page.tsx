import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Star } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSearch } from "@/components/home/hero-search";
import { Button } from "@/components/ui/button";
import { ServiceImage } from "@/components/ui/service-image";
import { connectDB } from "@/lib/db";
import { resolveServiceImage } from "@/lib/images";
import { Service } from "@/models/Service";
import { formatINR } from "@/lib/utils";

async function getPopularServices() {
  try {
    await connectDB();
    return Service.find({ popular: true, isActive: true }).limit(6).lean();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const popular = await getPopularServices();

  return (
    <SiteShell>
      <section className="mesh-bg overflow-hidden">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="hero-reveal inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
              <span className="h-1.5 w-1.5 rounded-full bg-pink" />
              Trusted home services
            </div>
            <h1 className="hero-reveal stagger-1 mt-4 max-w-xl font-display text-4xl leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-[3.4rem]">
              Book home help
              <span className="text-pink"> that shows up.</span>
            </h1>
            <p className="hero-reveal stagger-2 mt-4 max-w-md text-base text-black/60">
              Cleaning, beauty, repairs, and more — clear packages, pink-simple
              booking, verified professionals.
            </p>
            <HeroSearch />
            <div className="hero-reveal stagger-3 mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/55">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-pink" /> Verified pros
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-pink" /> Same-day slots
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-pink" /> 4.8+ rated
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/services">
                  Browse services <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/professionals">Find a pro</Link>
              </Button>
            </div>
          </div>

          <div className="hero-reveal stagger-2 relative hidden min-h-[380px] lg:block">
            <div className="absolute inset-0 rounded-[2rem] bg-black" />
            <ServiceImage
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80"
              alt="Professional home cleaning"
              className="absolute inset-2 rounded-[1.7rem]"
              imageClassName="rounded-[1.7rem]"
              priority
              sizes="45vw"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/95 p-4 backdrop-blur">
              <div className="text-sm font-semibold text-black">
                Deep home cleaning
              </div>
              <div className="mt-1 text-xs text-black/55">
                Packages from ₹599 · Pros bring supplies
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12">
        <CategoryGrid />
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-black">Popular now</h2>
            <p className="mt-1 text-sm text-black/55">Most booked this week</p>
          </div>
          <Link
            href="/services"
            className="text-sm font-medium text-pink hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((service) => (
            <Link
              key={String(service._id)}
              href={`/services/${service.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-pink/40 hover:shadow-[0_16px_40px_rgba(236,72,153,0.12)]"
            >
              <ServiceImage
                src={resolveServiceImage(service.image, service.category)}
                alt={service.name}
                className="h-44"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pink">
                  {service.category}
                </div>
                <div className="mt-1.5 text-base font-semibold text-black">
                  {service.name}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-black/55">
                    From {formatINR(service.startingPrice)}
                  </span>
                  <span className="rounded-full bg-pink-soft px-2.5 py-1 text-xs font-medium text-coral-dark">
                    Book
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-sand/60 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-black">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose a service",
                body: "Pick a category and package with clear pricing.",
              },
              {
                step: "2",
                title: "Pick time & address",
                body: "Select a slot and tell us where to come.",
              },
              {
                step: "3",
                title: "Relax",
                body: "A verified pro arrives and gets it done.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-black/55">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
