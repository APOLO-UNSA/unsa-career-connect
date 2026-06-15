import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { verifyProfile, calculateProfileScore } from "@/lib/verification";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  career: z.string().min(1),
  faculty: z.string().min(1),
  graduationStatus: z.enum(["ACTIVE", "GRADUATED", "TITLED"]),
});

// POST /api/students - Registro de nuevo estudiante
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            career: data.career,
            faculty: data.faculty,
            graduationStatus: data.graduationStatus,
            profileScore: 10,
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(
      { message: "Registro exitoso", studentId: user.student?.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// GET /api/students - Lista estudiantes (solo admin o empresa con verificación)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const career = searchParams.get("career");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  const where: Prisma.StudentWhereInput = {
    verificationStatus: { in: ["VERIFIED", "FLAGGED"] },
    ...(career && { career }),
    ...(status && { graduationStatus: status }),
  };

  const [students, total] = await Promise.all([
    db.student.findMany({
      where,
      include: {
        skills: { select: { name: true, level: true } },
        languages: { select: { language: true, level: true } },
        user: { select: { email: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { profileScore: "desc" },
    }),
    db.student.count({ where }),
  ]);

  return NextResponse.json({ students, total, page, pages: Math.ceil(total / limit) });
}
