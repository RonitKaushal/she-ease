import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Professional } from "@/models/Professional";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requirePro() {
  const result = await requireUser();
  if (result.error || !result.session) return result;

  const type = result.session.user.type;
  if (type !== "professional" && type !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Professionals only" },
        { status: 403 }
      ),
      session: null,
    };
  }
  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.error || !result.session) return result;
  if (result.session.user.type !== "admin") {
    return {
      error: NextResponse.json({ message: "Admins only" }, { status: 403 }),
      session: null,
    };
  }
  return result;
}

export async function getProfessionalForUser(userId: string) {
  await connectDB();
  return Professional.findOne({ user: userId });
}
