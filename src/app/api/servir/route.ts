import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { fetchServirJobs, filterJobsForStudent, dispatchServirAlerts } from "@/lib/servir";

// GET /api/servir?studentId=xxx - Convocatorias SERVIR para un estudiante
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId requerido" }, { status: 400 });
  }

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      skills: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  if (!student) return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });

  const skills = student.skills.map((s) => s.name);
  const jobs = filterJobsForStudent(student.career, skills);

  return NextResponse.json({
    career: student.career,
    total: jobs.length,
    jobs,
  });
}

// POST /api/servir - Despachar alertas SERVIR a todos los estudiantes verificados
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const students = await db.student.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: {
      skills: { select: { name: true } },
      user: { select: { email: true } },
    },
    take: 500,
  });

  const studentData = students.map((s) => ({
    id: s.id,
    email: s.user.email,
    name: `${s.firstName} ${s.lastName}`,
    career: s.career,
    skills: s.skills.map((sk) => sk.name),
  }));

  const result = await dispatchServirAlerts(studentData);

  return NextResponse.json({
    message: `Alertas SERVIR despachadas`,
    sent: result.sent,
    failed: result.failed,
    total: students.length,
  });
}
