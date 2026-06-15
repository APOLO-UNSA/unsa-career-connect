import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, email, password } = body;

    if (!tipo || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (tipo === "estudiante") {
      const { firstName, lastName, career } = body;
      if (!firstName || !lastName || !career) {
        return NextResponse.json({ error: "Faltan datos del estudiante." }, { status: 400 });
      }

      await db.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "STUDENT",
          student: {
            create: {
              firstName,
              lastName,
              career,
              verificationStatus: "PENDING",
            },
          },
        },
      });

      return NextResponse.json({ ok: true, message: "Cuenta de estudiante creada." });
    }

    if (tipo === "empresa") {
      const { companyName, ruc } = body;
      if (!companyName) {
        return NextResponse.json({ error: "Falta el nombre de la empresa." }, { status: 400 });
      }

      // ruc must be unique; generate a placeholder if not provided
      const rucValue = ruc || `PENDIENTE-${Date.now()}`;

      await db.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "COMPANY",
          company: {
            create: {
              name: companyName,
              ruc: rucValue,
              sector: "Sin especificar",
              contactEmail: email,
              verificationStatus: "PENDING",
            },
          },
        },
      });

      return NextResponse.json({ ok: true, message: "Cuenta de empresa creada." });
    }

    return NextResponse.json({ error: "Tipo de cuenta inválido." }, { status: 400 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
