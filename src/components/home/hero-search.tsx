"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/services?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="hero-reveal stagger-2 mt-8 flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-black/10 bg-white p-2 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="h-4 w-4 shrink-0 text-pink" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you need? e.g. AC service"
          className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="sm:min-w-[120px]">
        Search
      </Button>
    </form>
  );
}
