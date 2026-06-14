import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { performMatching, chatWithBolsa } from "@/lib/groq";
import type { ChatMessage } from "@/lib/groq";

const matchSchema = z.object({
  query: z.string().min(10, "Describe el puesto con más detalle"),
  companyId: z.string().cuid(),
});

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  companyId: z.string().cuid().optional(),
  companyName: z.string().optional(),
});

// POST /api/matching - Búsqueda de candidatos con IA
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userRole = (session.user as { role: string }).role;
  if (userRole !== "COMPANY" && userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo empresas pueden buscar candidatos" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { query, companyId } = matchSchema.parse(body);

    const result = await performMatching(query, companyId);

    return NextResponse.json({
      searchId: result.searchId,
      requirements: result.requirements,
      summary: result.llmSummary,
      totalFound: result.candidates.length,
      candidates: result.candidates.map((c) => ({
        id: c.id,
        name: c.name,
        career: c.career,
        faculty: c.faculty,
        graduationStatus: c.graduationStatus,
        gpa: c.gpa,
        skills: c.skills.slice(0, 10),
        experienceYears: Math.round(c.experienceYears * 10) / 10,
        salaryExpectation: c.salaryExpectation,
        availability: c.availability,
        languages: c.languages,
        matchScore: c.matchScore,
        matchRank: c.matchRank,
        explanation: c.explanation,
        // Info de contacto solo disponible para empresas verificadas
        contact: {
          email: c.email,
          phone: c.phone,
          linkedinUrl: c.linkedinUrl,
        },
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Matching error:", error);
    return NextResponse.json({ error: "Error en el servicio de IA" }, { status: 500 });
  }
}

// POST /api/matching/chat - Chat conversacional para refinar búsqueda
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { messages, companyName } = chatSchema.parse(body);

    const context = companyName
      ? `La empresa "${companyName}" está buscando candidatos en la Bolsa de Trabajo UNSA.`
      : undefined;

    const reply = await chatWithBolsa(messages as ChatMessage[], context);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Error en el chat" }, { status: 500 });
  }
}
