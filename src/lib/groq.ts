/**
 * Groq LLM Service - Motor de Matching de Candidatos
 *
 * Usa llama-3.1-70b-versatile (rápido y económico: ~$0.05/M tokens input)
 * como LLM para extraer requisitos de puestos y rankear candidatos.
 */

import Groq from "groq-sdk";
import { db } from "./db";
import type {
  ExtractedJobRequirements,
  CandidateProfile,
  RankedCandidate,
} from "./types";
import { SALARY_BENCHMARKS } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-70b-versatile";

// ─── Paso 1: Extracción de requisitos ────────────────────────────────────────

export async function extractJobRequirements(
  naturalLanguageQuery: string
): Promise<ExtractedJobRequirements> {
  const SYSTEM_PROMPT = `Eres un asistente experto en recursos humanos para la Universidad Nacional de San Agustín de Arequipa (UNSA), Perú.
Tu tarea es extraer los requisitos de un puesto de trabajo a partir de una descripción en lenguaje natural.

Carreras disponibles en UNSA:
Administración, Banca y Seguros, Marketing, Gestión, Arquitectura, Agronomía, Biología, Ciencias de la Nutrición,
Ingeniería Pesquera, Contabilidad, Finanzas, Educación, Antropología, Historia, Sociología, Trabajo Social,
Turismo y Hotelería, Física, Química, Matemáticas, Derecho, Economía, Enfermería, Artes Plásticas, Música,
Filosofía, Literatura y Lingüística, Ingeniería Geológica, Ingeniería Geofísica, Ingeniería de Minas,
Ingeniería Civil, Ingeniería Sanitaria, Ingeniería Metalúrgica, Ingeniería Química,
Ingeniería de Industrias Alimentarias, Ingeniería de Materiales, Ingeniería Ambiental, Ingeniería Eléctrica,
Ingeniería Electrónica, Ingeniería Industrial, Ingeniería Mecánica, Ingeniería de Sistemas,
Ciencia de la Computación, Ingeniería en Telecomunicaciones, Medicina, Psicología,
Relaciones Públicas, Periodismo, Relaciones Industriales.

Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "careers": ["lista de carreras compatibles de UNSA"],
  "skills": ["lista de habilidades técnicas y blandas requeridas"],
  "experienceYears": 0,
  "salaryMin": null,
  "salaryMax": null,
  "modality": "Presencial | Remoto | Híbrido | null",
  "location": "ciudad o null",
  "workType": "Tiempo completo | Prácticas profesionales | Part-time | Consultoría",
  "additionalNotes": "requisitos adicionales importantes"
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extrae los requisitos de este puesto:\n\n"${naturalLanguageQuery}"`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as ExtractedJobRequirements;
}

// ─── Paso 2: Consulta de candidatos en base de datos ─────────────────────────

export async function queryMatchingStudents(
  requirements: ExtractedJobRequirements
): Promise<CandidateProfile[]> {
  const students = await db.student.findMany({
    where: {
      verificationStatus: { in: ["VERIFIED", "FLAGGED"] },
      career: requirements.careers.length > 0
        ? { in: requirements.careers }
        : undefined,
      salaryExpectation: requirements.salaryMax
        ? { lte: requirements.salaryMax * 1.2 }
        : undefined,
      ...(requirements.experienceYears > 0 && {
        // Filtra por año de graduación aproximado
        graduationYear: { lte: new Date().getFullYear() - requirements.experienceYears + 2 },
      }),
    },
    include: {
      skills: true,
      experience: true,
      languages: true,
      user: { select: { email: true } },
    },
    take: 50,
  });

  return students.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    career: s.career,
    faculty: s.faculty,
    graduationStatus: s.graduationStatus,
    graduationYear: s.graduationYear,
    gpa: s.gpa,
    salaryExpectation: s.salaryExpectation,
    skills: s.skills.map((sk) => sk.name),
    experienceYears: s.experience.reduce((acc, exp) => {
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const start = new Date(exp.startDate);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }, 0),
    availability: s.availability,
    languages: s.languages.map((l) => `${l.language} (${l.level})`),
    email: s.user.email,
    phone: s.phone,
    linkedinUrl: s.linkedinUrl,
    headline: s.headline,
    verificationStatus: s.verificationStatus,
    profileScore: s.profileScore,
  }));
}

// ─── Paso 3: Ranking con LLM ─────────────────────────────────────────────────

export async function rankCandidates(
  candidates: CandidateProfile[],
  requirements: ExtractedJobRequirements,
  originalQuery: string
): Promise<RankedCandidate[]> {
  if (candidates.length === 0) return [];

  const SYSTEM_PROMPT = `Eres un experto en selección de personal para empresas peruanas.
Debes rankear candidatos de la Universidad Nacional de San Agustín de Arequipa (UNSA) según su idoneidad para un puesto.

Criterios de evaluación (total 100 puntos):
- Alineación de carrera con el puesto: 30 pts
- Habilidades técnicas coincidentes: 25 pts
- Experiencia laboral relevante: 20 pts
- Promedio académico (GPA/20): 10 pts
- Expectativa salarial dentro del rango ofrecido: 10 pts
- Completitud y calidad del perfil: 5 pts

Devuelve SOLO un JSON válido con esta estructura:
{
  "rankings": [
    {
      "candidateId": "id del candidato",
      "score": 85.5,
      "explanation": "Explicación concisa en español de por qué es buen candidato (max 150 palabras)"
    }
  ]
}`;

  const candidateSummaries = candidates.map((c) => ({
    id: c.id,
    carrera: c.career,
    estadoGraduacion: c.graduationStatus,
    promedio: c.gpa ? `${c.gpa}/20` : "No especificado",
    habilidades: c.skills.slice(0, 15).join(", "),
    experienciaAnios: Math.round(c.experienceYears * 10) / 10,
    expectativaSalarial: c.salaryExpectation
      ? `S/ ${c.salaryExpectation} - ${c.salaryExpectationMax ?? c.salaryExpectation * 1.3}`
      : "No especificada",
    idiomas: c.languages.join(", ") || "Solo español",
    disponibilidad: c.availability,
    puntajePerfil: c.profileScore,
  }));

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Puesto requerido:\n${originalQuery}\n\nRequisitos extraídos:\n${JSON.stringify(requirements, null, 2)}\n\nCandidatos a evaluar:\n${JSON.stringify(candidateSummaries, null, 2)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"rankings":[]}';
  const { rankings } = JSON.parse(content) as {
    rankings: { candidateId: string; score: number; explanation: string }[];
  };

  const ranked = rankings
    .sort((a, b) => b.score - a.score)
    .map((r, idx) => {
      const candidate = candidates.find((c) => c.id === r.candidateId);
      if (!candidate) return null;
      return {
        ...candidate,
        matchScore: Math.min(100, Math.max(0, r.score)),
        matchRank: idx + 1,
        explanation: r.explanation,
      } as RankedCandidate;
    })
    .filter(Boolean) as RankedCandidate[];

  return ranked;
}

// ─── Flujo completo de matching ───────────────────────────────────────────────

export async function performMatching(
  naturalLanguageQuery: string,
  companyId: string
): Promise<{
  requirements: ExtractedJobRequirements;
  candidates: RankedCandidate[];
  searchId: string;
  llmSummary: string;
}> {
  const requirements = await extractJobRequirements(naturalLanguageQuery);
  const candidates = await queryMatchingStudents(requirements);
  const ranked = await rankCandidates(candidates, requirements, naturalLanguageQuery);

  // Generar resumen ejecutivo del puesto
  const summaryResponse = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `Resume en 2 oraciones qué tipo de candidato ideal se busca según: "${naturalLanguageQuery}"`,
      },
    ],
    max_tokens: 150,
    temperature: 0.3,
  });
  const llmSummary = summaryResponse.choices[0]?.message?.content ?? "";

  // Guardar búsqueda y resultados en base de datos
  const search = await db.matchingSearch.create({
    data: {
      companyId,
      naturalLanguageQuery,
      extractedCareers: requirements.careers,
      extractedSkills: requirements.skills,
      extractedExperience: requirements.experienceYears,
      salaryMin: requirements.salaryMin,
      salaryMax: requirements.salaryMax,
      modality: requirements.modality,
      location: requirements.location,
      workType: requirements.workType,
      llmSummary,
      results: {
        create: ranked.map((c) => ({
          studentId: c.id,
          matchScore: c.matchScore,
          explanation: c.explanation,
          rank: c.matchRank,
        })),
      },
    },
  });

  return { requirements, candidates: ranked, searchId: search.id, llmSummary };
}

// ─── Chat conversacional ──────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithBolsa(
  messages: ChatMessage[],
  companyContext?: string
): Promise<string> {
  const SYSTEM = `Eres el asistente virtual de la Bolsa de Trabajo UNSA (Universidad Nacional de San Agustín de Arequipa).
Ayudas a empresas a encontrar candidatos entre estudiantes y egresados de la UNSA.
Puedes:
1. Entender qué tipo de candidato busca la empresa
2. Explicar el proceso de búsqueda
3. Aclarar dudas sobre perfiles disponibles
4. Confirmar que para iniciar la búsqueda la empresa debe proporcionar el rango salarial

Responde siempre en español, de forma profesional y concisa.
${companyContext ? `\nContexto de la empresa: ${companyContext}` : ""}

Cuando tengas suficiente información del puesto (cargo, requisitos, rango salarial),
responde con: "Perfecto. Tengo suficiente información para buscar candidatos. ¿Deseas que inicie la búsqueda ahora?"`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM },
      ...messages,
    ],
    temperature: 0.5,
    max_tokens: 512,
  });

  return response.choices[0]?.message?.content ?? "Lo siento, hubo un error. Por favor intenta nuevamente.";
}

// ─── Estimación salarial por carrera ─────────────────────────────────────────

export function getSalaryBenchmark(career: string) {
  return SALARY_BENCHMARKS[career] ?? SALARY_BENCHMARKS["default"];
}
