"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  async function loadNotifications() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications || []);
    setUnread(data.unread || 0);
  }

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    async function tick() {
      const res = await fetch("/api/notifications");
      if (!res.ok || !active) return;
      const data = await res.json();
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    }
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [session?.user]);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (!session?.user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void loadNotifications();
        }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink px-1 text-[10px] text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-black/10 px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              type="button"
              className="text-xs text-pink"
              onClick={markAll}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item._id}
                href={item.link || "#"}
                onClick={() => setOpen(false)}
                className={`block border-b border-black/5 px-3 py-2.5 text-sm hover:bg-pink-soft ${
                  item.read ? "opacity-70" : ""
                }`}
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-black/55">{item.message}</div>
              </Link>
            ))}
            {!items.length && (
              <p className="px-3 py-6 text-center text-sm text-black/45">
                No notifications yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
