import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreatePayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await prisma.tempahan.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("GET /api/tempahan error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal memuatkan rekod tempahan. Sila pastikan sambungan pangkalan data PostgreSQL (DATABASE_URL) telah dikonfigurasi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Muatan JSON tidak sah." },
      { status: 400 }
    );
  }

  const validation = validateCreatePayload(body);
  if (validation.error || !validation.data) {
    return NextResponse.json(
      { error: validation.error ?? "Data tempahan tidak sah." },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.tempahan.create({
      data: validation.data,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/tempahan error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menyimpan tempahan baharu. Sila semak sambungan pangkalan data anda.",
      },
      { status: 500 }
    );
  }
}
