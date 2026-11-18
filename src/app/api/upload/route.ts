import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";

export async function POST(req: Request) {
  const { error } = await requireUser();
  if (error) return error;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "general");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File required" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Max 5MB" }, { status: 400 });
    }

    const url = await saveUpload(file, folder.replace(/[^a-z0-9-_]/gi, ""));
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
