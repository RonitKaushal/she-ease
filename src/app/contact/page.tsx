"use client";

import { toast } from "sonner";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl text-charcoal">Contact us</h1>
        <p className="mt-2 text-charcoal/60">
          We usually reply within one business day.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent — we'll get back to you soon");
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input required name="name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input required type="email" name="email" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea required name="message" />
          </div>
          <Button type="submit">Send message</Button>
        </form>
      </div>
    </SiteShell>
  );
}
