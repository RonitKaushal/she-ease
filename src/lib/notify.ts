import { Notification } from "@/models/Notification";

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: "booking" | "payment" | "system" | "dispute" | "verification";
  link?: string;
  meta?: Record<string, unknown>;
}) {
  return Notification.create({
    user: input.userId,
    title: input.title,
    message: input.message,
    type: input.type || "system",
    link: input.link || "",
    meta: input.meta || {},
  });
}
