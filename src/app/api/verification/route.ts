import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET /api/verification - Panel de alertas para admin
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const resolved = searchParams.get("resolved") === "true";

  const alerts = await db.verificationAlert.findMany({
    where: {
      resolved,
      ...(severity && { severity: severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }),
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          career: true,
          faculty: true,
          verificationStatus: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });

  // Agrupar por estudiante
  const byStudent = alerts.reduce((acc, alert) => {
    const key = alert.studentId;
    if (!acc[key]) {
      acc[key] = { student: alert.student, alerts: [] };
    }
    acc[key].alerts.push({
      id: alert.id,
      field: alert.field,
      issue: alert.issue,
      severity: alert.severity,
      createdAt: alert.createdAt,
    });
    return acc;
  }, {} as Record<string, unknown>);

  const pending = await db.student.count({
    where: { verificationStatus: "IN_REVIEW" },
  });

  const flagged = await db.student.count({
    where: { verificationStatus: "FLAGGED" },
  });

  return NextResponse.json({
    alertsByStudent: Object.values(byStudent),
    summary: {
      pending,
      flagged,
      totalAlerts: alerts.length,
      critical: alerts.filter((a) => a.severity === "CRITICAL").length,
      high: alerts.filter((a) => a.severity === "HIGH").length,
    },
  });
}

const resolveSchema = z.object({
  studentId: z.string().cuid(),
  action: z.enum(["VERIFY", "REJECT", "FLAG_FOR_MEETING"]),
  notes: z.string().optional(),
  alertIds: z.array(z.string()).optional(),
});

// POST /api/verification - Resolver caso de verificación
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const adminId = (session.user as { profileId: string }).profileId;

  try {
    const body = await req.json();
    const { studentId, action, notes, alertIds } = resolveSchema.parse(body);

    const statusMap = {
      VERIFY: "VERIFIED",
      REJECT: "REJECTED",
      FLAG_FOR_MEETING: "FLAGGED",
    } as const;

    await db.student.update({
      where: { id: studentId },
      data: {
        verificationStatus: statusMap[action],
        verificationNotes: notes,
        verifiedAt: action === "VERIFY" ? new Date() : undefined,
        verifiedBy: action === "VERIFY" ? adminId : undefined,
      },
    });

    // Marcar alertas como resueltas
    if (alertIds && alertIds.length > 0) {
      await db.verificationAlert.updateMany({
        where: { id: { in: alertIds }, studentId },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: adminId,
          notes,
        },
      });
    }

    return NextResponse.json({
      message: `Perfil actualizado: ${statusMap[action]}`,
      status: statusMap[action],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
