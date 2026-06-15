import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

function isOwner(session: Awaited<ReturnType<typeof getServerSession>>, id: string) {
  return (session?.user as { profileId?: string })?.profileId === id;
}

// POST /api/students/[id]/certifications — agregar formación complementaria
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session, params.id))
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  const { name, issuer, issueDate, credentialUrl } = await req.json();
  if (!name || !issuer)
    return NextResponse.json({ error: "Nombre e institución requeridos" }, { status: 400 });

  const cert = await db.certification.create({
    data: {
      studentId: params.id,
      name,
      issuer,
      issueDate: issueDate ? new Date(issueDate) : null,
      credentialUrl: credentialUrl || null,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}

// DELETE /api/students/[id]/certifications?certId=xxx
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session, params.id))
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  const certId = new URL(req.url).searchParams.get("certId");
  if (!certId)
    return NextResponse.json({ error: "certId requerido" }, { status: 400 });

  await db.certification.deleteMany({ where: { id: certId, studentId: params.id } });
  return NextResponse.json({ ok: true });
}
