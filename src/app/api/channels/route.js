import { NextResponse } from "next/server";
import { getChannelsList } from "@/lib/channels-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const channels = await getChannelsList();
    return NextResponse.json({
      success: true,
      total: channels.length,
      channels,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar channel" },
      { status: 500 }
    );
  }
}
