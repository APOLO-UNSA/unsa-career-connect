import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { verifyProfile, calculateProfileScore } from "@/lib/verification";

const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  headline: z.string().max(120).optional(),
  summary: z.string().max(1000).optional(),
  gpa: z.number().min(0).max(20).optional().nullable(),
  salaryExpectation: z.number().min(0).optional().nullable(),
  salaryExpectationMax: z.number().min(0).optional().nullable(),
  availability: z.enum(["IMMEDIATE", "IN_30_DAYS", "IN_60_DAYS", "IN_90_DAYS", "INTERNSHIP_ONLY", "PART_TIME_ONLY"]).optional(),
  workModality: z.string().optional(),
  graduationYear: z.number().optional().nullable(),
  admissionYear: z.number().optional().nullable(),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string(),
    level: z.number().min(1).max(5),
    yearsUsed: z.number().optional(),
  })).optional(),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    isCurrent: z.boolean().optional(),
    salary: z.number().optional().nullable(),
    location: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    level: z.string(),
    certified: z.boolean().optional(),
  })).optional(),
}).partial();

// GET /api/students/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const student = await db.student.findUnique({
    where: { id: params.id },
    include: {
      skills: true,
      experience: true,
      education: true,
      languages: true,
      certifications: true,
      alerts: { where: { resolved: false } },
      user: { select: { email: true } },
    },
  });

  if (!student) return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });

  const userRole = (session.user as { role: string }).role;
  const userId = (session.user as { profileId: string }).profileId;

  // Empresas solo ven perfiles verificados
  if (userRole === "COMPANY" && student.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "Perfil no disponible" }, { status: 403 });
  }

  // Solo el propio estudiante ve info de contacto completa
  if (userRole === "COMPANY") {
    const { user: _u, alerts: _a, ...publicProfile } = student;
    return NextResponse.json(publicProfile);
  }

  return NextResponse.json(student);
}

// PATCH /api/students/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const profileId = (session.user as { profileId: string }).profileId;
  if (profileId !== params.id && (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Ejecutar verificación de anomalías si se actualizan datos clave
    const existing = await db.student.findUnique({
      where: { id: params.id },
      include: { skills: true, experience: true },
    });
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const profileForVerification = {
      career: existing.career,
      gpa: data.gpa ?? existing.gpa,
      salaryExpectation: data.salaryExpectation ?? existing.salaryExpectation,
      graduationYear: data.graduationYear ?? existing.graduationYear,
      admissionYear: data.admissionYear ?? existing.admissionYear,
      graduationStatus: existing.graduationStatus,
      experienceEntries: (data.experience ?? existing.experience).map((e: { startDate: string | Date; endDate?: string | Date | null; salary?: number | null; position: string; company: string }) => ({
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        salary: e.salary,
        position: e.position,
        company: e.company,
      })),
      skills: (data.skills ?? existing.skills).map((s: { name: string; level: number; yearsUsed?: number | null }) => ({
        name: s.name,
        level: s.level,
        yearsUsed: s.yearsUsed,
      })),
      certifications: [],
    };

    const verification = verifyProfile(profileForVerification);

    // Guardar alertas de verificación en DB
    if (verification.alerts.length > 0) {
      // Eliminar alertas anteriores no resueltas
      await db.verificationAlert.deleteMany({
        where: { studentId: params.id, resolved: false },
      });

      await db.verificationAlert.createMany({
        data: verification.alerts.map((a) => ({
          studentId: params.id,
          field: a.field,
          issue: a.issue,
          severity: a.severity,
        })),
      });
    }

    // Determinar nuevo estado de verificación
    let newVerificationStatus = existing.verificationStatus;
    if (verification.overallRisk === "CRITICAL") {
      newVerificationStatus = "FLAGGED";
    } else if (verification.overallRisk === "HIGH") {
      newVerificationStatus = "IN_REVIEW";
    } else if (existing.verificationStatus === "PENDING") {
      newVerificationStatus = "IN_REVIEW";
    }

    const { skills, experience, languages, ...baseData } = data;

    const updatedStudent = await db.student.update({
      where: { id: params.id },
      data: {
        ...baseData,
        verificationStatus: newVerificationStatus,
        ...(skills && {
          skills: {
            deleteMany: {},
            create: skills.map((s) => ({
              name: s.name,
              category: s.category,
              level: s.level,
              yearsUsed: s.yearsUsed,
            })),
          },
        }),
        ...(experience && {
          experience: {
            deleteMany: {},
            create: experience.map((e) => ({
              company: e.company,
              position: e.position,
              description: e.description,
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : null,
              isCurrent: e.isCurrent ?? false,
              salary: e.salary,
              location: e.location,
            })),
          },
        }),
        ...(languages && {
          languages: {
            deleteMany: {},
            create: languages.map((l) => ({
              language: l.language,
              level: l.level,
              certified: l.certified ?? false,
            })),
          },
        }),
      },
      include: { skills: true, experience: true, languages: true },
    });

    // Recalcular puntaje de perfil
    const profileScore = calculateProfileScore({
      firstName: updatedStudent.firstName,
      lastName: updatedStudent.lastName,
      phone: updatedStudent.phone,
      linkedinUrl: updatedStudent.linkedinUrl,
      headline: updatedStudent.headline,
      summary: updatedStudent.summary,
      gpa: updatedStudent.gpa,
      salaryExpectation: updatedStudent.salaryExpectation,
      skillsCount: updatedStudent.skills.length,
      experienceCount: updatedStudent.experience.length,
      educationCount: 0,
      languagesCount: updatedStudent.languages.length,
      certificationsCount: 0,
      photoUrl: updatedStudent.photoUrl,
    });

    await db.student.update({ where: { id: params.id }, data: { profileScore } });

    return NextResponse.json({
      student: { ...updatedStudent, profileScore },
      verification: {
        status: newVerificationStatus,
        alerts: verification.alerts,
        overallRisk: verification.overallRisk,
        requiresReview: verification.overallRisk !== "LOW",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
