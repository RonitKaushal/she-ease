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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [email, setEmail] = useState("demo.user@sheease.com");
  const [password, setPassword] = useState("user123");
  const [phone, setPhone] = useState("9876500001");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    const isPro = email.toLowerCase().includes("demo.pro");
    const isAdmin = email.toLowerCase().includes("admin@");
    router.push(
      callbackUrl ||
        (isAdmin ? "/admin" : isPro ? "/pro/dashboard" : "/dashboard")
    );
    router.refresh();
  }

  async function sendOtp() {
    setLoading(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.message || "Failed to send OTP");
      return;
    }
    setDemoOtp(data.demoOtp || "");
    setOtp(data.demoOtp || "");
    toast.success(`OTP sent (demo: ${data.demoOtp})`);
  }

  async function onOtpLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("otp", {
      phone,
      code: otp,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid or expired OTP");
      return;
    }
    toast.success("Logged in with OTP");
    router.push(callbackUrl || "/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Email password or phone OTP — both work on SheEase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="otp">Phone OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={onEmailLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="otp">
            <form onSubmit={onOtpLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={sendOtp}
                disabled={loading}
              >
                Send OTP
              </Button>
              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  required
                />
                {demoOtp && (
                  <p className="text-xs text-pink">Demo OTP: {demoOtp}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Verify & sign in
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 space-y-1 rounded-xl bg-sand p-3 text-xs text-black/65">
          <p>Customer: demo.user@sheease.com / user123</p>
          <p>Pro: demo.pro@sheease.com / pro123</p>
          <p>Admin: admin@sheease.com / admin123</p>
        </div>
        <p className="mt-4 text-center text-sm text-black/60">
          New here?{" "}
          <Link href="/register" className="text-pink hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <SiteShell>
      <div className="mesh-bg flex justify-center px-4 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </SiteShell>
  );
}
