import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("pdf");

  if (!file || typeof file === "string") {
    return new Response(JSON.stringify({ error: "No PDF file provided" }), { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.promises.writeFile(filePath, buffer);

  return new Response(JSON.stringify({ url: `/uploads/${filename}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
