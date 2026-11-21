import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validatePatchPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(rawId: string): number | null {
  const numericId = Number(rawId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { error: "ID tempahan tidak sah." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Muatan JSON tidak sah." },
      { status: 400 }
    );
  }

  const validation = validatePatchPayload(body);
  if (validation.error || !validation.data) {
    return NextResponse.json(
      { error: validation.error ?? "Data kemaskini tidak sah." },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.tempahan.update({
      where: { id: numericId },
      data: validation.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod tempahan tidak ditemui." },
        { status: 404 }
      );
    }

    console.error("PATCH /api/tempahan/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengemaskini rekod tempahan." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { error: "ID tempahan tidak sah." },
      { status: 400 }
    );
  }

  try {
    await prisma.tempahan.delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: "Tempahan berjaya dipadam.", id: numericId },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod tempahan tidak ditemui." },
        { status: 404 }
      );
    }

    console.error("DELETE /api/tempahan/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memadam rekod tempahan." },
      { status: 500 }
    );
  }
}
