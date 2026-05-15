import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

function getUploadsDir() {
  if (process.env.RENDER === "true") {
    return "/var/data/uploads";
  }
  return path.join(process.cwd(), "public", "uploads");
}

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Защита от path traversal
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadsDir(), filename);

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
