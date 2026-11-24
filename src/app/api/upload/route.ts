import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

const UPLOAD_DIR = "/tmp/flowvault-uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024;

async function readBoundedFormData(req: Request): Promise<FormData> {
  if (!req.body) throw new Error("Missing upload body");
  const reader = req.body.getReader();
  const chunks: BlobPart[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_SIZE) {
      await reader.cancel();
      throw new Error("Upload request is too large");
    }
    chunks.push(value.slice().buffer as ArrayBuffer);
  }
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  const boundedRequest = new Request(req.url, { method: "POST", headers, body: new Blob(chunks) });
  return boundedRequest.formData();
}

function detectAllowedType(bytes: Buffer): { extension: string; mime: string } | undefined {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: ".png", mime: "image/png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { extension: ".jpg", mime: "image/jpeg" };
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") return { extension: ".pdf", mime: "application/pdf" };
  return undefined;
}

export async function POST(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json({ error: "File exceeds the 5 MB limit" }, { status: 413, headers: createCorsHeaders() });
  }

  try {
    const formData = await readBoundedFormData(req);
    const entry = formData.get("file");
    if (!(entry instanceof File)) return NextResponse.json({ error: "A file is required" }, { status: 400, headers: createCorsHeaders() });
    if (entry.size === 0 || entry.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be between 1 byte and 5 MB" }, { status: 413, headers: createCorsHeaders() });
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    const detected = detectAllowedType(buffer);
    if (!detected) return NextResponse.json({ error: "Only PNG, JPEG, and PDF files are accepted" }, { status: 415, headers: createCorsHeaders() });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const fileId = randomUUID();
    const targetPath = path.join(UPLOAD_DIR, `${fileId}${detected.extension}`);
    fs.writeFileSync(targetPath, buffer, { flag: "wx", mode: 0o600 });
    return NextResponse.json(
      { message: "File uploaded successfully", file: { id: fileId, original_name: path.basename(entry.name).slice(0, 120), size_bytes: buffer.length, mime_type: detected.mime } },
      { status: 201, headers: createCorsHeaders() }
    );
  } catch (error) {
    const tooLarge = error instanceof Error && error.message.includes("too large");
    return NextResponse.json({ error: tooLarge ? "Upload request exceeds the 5 MB limit" : "Invalid upload request" }, { status: tooLarge ? 413 : 400, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
