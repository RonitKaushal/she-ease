"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/constants";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialType =
    params.get("type") === "professional" ? "professional" : "user";
  const [type, setType] = useState<"user" | "professional">(initialType);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    profession: "",
    category: "cleaning",
    city: "Mumbai",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.error) {
        toast.success("Account created — please sign in");
        router.push("/login");
        return;
      }

      toast.success("Welcome to SheEase");
      router.push(type === "professional" ? "/pro/dashboard" : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Book services as a customer, or join as a verified professional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-sand p-1">
          <button
            type="button"
            onClick={() => setType("user")}
            className={`rounded-lg py-2 text-sm font-medium ${
              type === "user" ? "bg-white shadow-sm" : "text-charcoal/60"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setType("professional")}
            className={`rounded-lg py-2 text-sm font-medium ${
              type === "professional" ? "bg-white shadow-sm" : "text-charcoal/60"
            }`}
          >
            Professional
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>

          {type === "professional" && (
            <>
              <div className="space-y-2">
                <Label>Profession title</Label>
                <Input
                  value={form.profession}
                  onChange={(e) =>
                    setForm({ ...form, profession: e.target.value })
                  }
                  placeholder="e.g. Plumbing Expert"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-charcoal/12 bg-white px-3 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link href="/login" className="text-coral hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <SiteShell>
      <div className="mesh-bg flex justify-center px-4 py-16">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </SiteShell>
  );
}
