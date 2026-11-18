import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(file: File, folder = "general") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".bin";
  const safeExt = ext.slice(0, 10);
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${safeExt}`;
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}
