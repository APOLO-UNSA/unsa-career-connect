import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

function isOwner(session: Awaited<ReturnType<typeof getServerSession>>, id: string) {
  return (session?.user as { profileId?: string })?.profileId === id;
}

// POST /api/students/[id]/education — agregar posgrado
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session, params.id))
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  const { degree, field, institution, startYear, endYear, isCurrent } = await req.json();
  if (!degree || !institution || !startYear)
    return NextResponse.json({ error: "Grado, institución y año de inicio requeridos" }, { status: 400 });

  const edu = await db.education.create({
    data: {
      studentId: params.id,
      degree,
      field: field || null,
      institution,
      startYear: Number(startYear),
      endYear: endYear ? Number(endYear) : null,
      isCurrent: isCurrent ?? false,
    },
  });

  return NextResponse.json(edu, { status: 201 });
}

// DELETE /api/students/[id]/education?eduId=xxx
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session, params.id))
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  const eduId = new URL(req.url).searchParams.get("eduId");
  if (!eduId)
    return NextResponse.json({ error: "eduId requerido" }, { status: 400 });

  await db.education.deleteMany({ where: { id: eduId, studentId: params.id } });
  return NextResponse.json({ ok: true });
}
