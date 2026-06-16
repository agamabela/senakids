import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "pdfs";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("pdf");

  if (!file || typeof file === "string") {
    return new Response(JSON.stringify({ error: "No PDF file provided" }), { status: 400 });
  }

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filename, buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(data.path);

    if (urlError) {
      return new Response(JSON.stringify({ error: urlError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ url: urlData.publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  return new Response(JSON.stringify({ url: `/uploads/${filename}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
