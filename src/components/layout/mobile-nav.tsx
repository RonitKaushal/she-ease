"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, Home, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const dashHref =
    session?.user?.type === "professional" ? "/pro/dashboard" : "/dashboard";

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Search },
    {
      href: session?.user ? dashHref : "/login",
      label: session?.user ? "Bookings" : "Sign in",
      icon: CalendarDays,
    },
    {
      href: session?.user ? dashHref : "/register",
      label: "Account",
      icon: UserRound,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px]",
                active ? "text-pink" : "text-black/50"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
