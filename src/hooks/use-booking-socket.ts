"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export function useBookingSocket(bookingId?: string) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<unknown>(null);

  useEffect(() => {
    if (!bookingId) return;
    let socket: Socket | null = null;
    try {
      socket = io({
        path: "/api/socket",
        transports: ["websocket", "polling"],
      });
      socket.on("connect", () => {
        setConnected(true);
        socket?.emit("join:booking", bookingId);
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("booking:update", (payload) => setLastEvent(payload));
    } catch {
      setConnected(false);
    }
    return () => {
      socket?.disconnect();
    };
  }, [bookingId]);

  return { connected, lastEvent };
}
