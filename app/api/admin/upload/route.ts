import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUploadUrl } from "@/server/services/storage";

/**
 * Issues a presigned S3 upload URL.
 * Staff-only — otherwise anyone could dump files in your bucket.
 */
export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "admin" && role !== "editor")) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: { fileName?: string; contentType?: string; size?: number; folder?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }

  const { fileName, contentType, size, folder } = body;
  if (!fileName || !contentType || typeof size !== "number") {
    return NextResponse.json(
      { ok: false, message: "fileName, contentType and size are required" },
      { status: 400 }
    );
  }

  const result = await createUploadUrl(fileName, contentType, size, folder);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
