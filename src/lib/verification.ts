/**
 * Sistema de Verificación y Detección de Anomalías
 *
 * Analiza perfiles de estudiantes/egresados para detectar datos exagerados
 * o incoherentes que requieran validación presencial en oficinas UDEEG.
 */

import { SALARY_BENCHMARKS } from "./types";
import type { VerificationResult } from "./types";

const PERU_MIN_WAGE = 1025; // Soles mensuales (2024)

interface ProfileToVerify {
  career: string;
  gpa?: number | null;
  salaryExpectation?: number | null;
  salaryExpectationMax?: number | null;
  graduationYear?: number | null;
  admissionYear?: number | null;
  graduationStatus: string;
  experienceEntries: {
    startDate: Date;
    endDate: Date | null;
    salary?: number | null;
    position: string;
    company: string;
  }[];
  skills: {
    name: string;
    level: number;
    yearsUsed?: number | null;
  }[];
  certifications: {
    name: string;
    issuer: string;
  }[];
}

// ─── Validadores individuales ─────────────────────────────────────────────────

function checkGPA(gpa: number | null | undefined, career: string) {
  const alerts: VerificationResult["alerts"] = [];
  if (gpa == null) return alerts;

  if (gpa < 0 || gpa > 20) {
    alerts.push({
      field: "gpa",
      issue: `Promedio académico de ${gpa} está fuera del rango válido (0–20). El sistema de calificaciones de la UNSA es sobre 20 puntos.`,
      severity: "CRITICAL",
    });
  } else if (gpa > 19.5) {
    alerts.push({
      field: "gpa",
      issue: `Promedio académico de ${gpa}/20 es excepcionalmente alto. Requiere verificación con registros académicos de la UNSA.`,
      severity: "MEDIUM",
    });
  } else if (gpa < 7) {
    alerts.push({
      field: "gpa",
      issue: `Promedio académico de ${gpa}/20 está por debajo del mínimo aprobatorio habitual. Verificar si el estudiante cumple requisitos de graduación.`,
      severity: "HIGH",
    });
  }

  return alerts;
}

function checkSalaryExpectation(
  salaryExpectation: number | null | undefined,
  career: string,
  graduationStatus: string
) {
  const alerts: VerificationResult["alerts"] = [];
  if (salaryExpectation == null) return alerts;

  const benchmark = SALARY_BENCHMARKS[career] ?? SALARY_BENCHMARKS["default"];
  const isStudent = graduationStatus === "ACTIVE";

  if (salaryExpectation < PERU_MIN_WAGE) {
    alerts.push({
      field: "salaryExpectation",
      issue: `Expectativa salarial de S/ ${salaryExpectation} está por debajo del salario mínimo legal (S/ ${PERU_MIN_WAGE}).`,
      severity: "HIGH",
    });
  }

  const threshold = isStudent ? benchmark.median * 0.7 : benchmark.max * 1.5;
  if (salaryExpectation > threshold) {
    const pct = Math.round((salaryExpectation / benchmark.median - 1) * 100);
    alerts.push({
      field: "salaryExpectation",
      issue: `Expectativa salarial de S/ ${salaryExpectation} es ${pct}% superior a la mediana del mercado para ${career} (S/ ${benchmark.median}). Máximo referencial: S/ ${benchmark.max}.`,
      severity: salaryExpectation > benchmark.max * 2 ? "HIGH" : "MEDIUM",
    });
  }

  return alerts;
}

function checkExperienceTimeline(
  entries: ProfileToVerify["experienceEntries"],
  admissionYear?: number | null,
  graduationYear?: number | null
) {
  const alerts: VerificationResult["alerts"] = [];

  let totalMonths = 0;
  const now = new Date();

  for (const exp of entries) {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : now;

    if (start > end) {
      alerts.push({
        field: "experience",
        issue: `La experiencia en "${exp.company}" tiene fecha de inicio posterior a la fecha de fin.`,
        severity: "HIGH",
      });
      continue;
    }

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += months;

    // No puede haber trabajado antes de los 16 años (estimado)
    if (start.getFullYear() < 2000) {
      alerts.push({
        field: "experience",
        issue: `Fecha de inicio en "${exp.company}" (${start.getFullYear()}) parece incorrecta.`,
        severity: "MEDIUM",
      });
    }

    // Si tiene admisión registrada, no puede haber trabajado full-time antes de admitirse (en empleos anteriores a UNSA)
    if (admissionYear && start.getFullYear() < admissionYear - 5) {
      alerts.push({
        field: "experience",
        issue: `Experiencia en "${exp.company}" registrada antes de ${admissionYear - 5} parece excesivamente temprana dado el año de admisión (${admissionYear}).`,
        severity: "LOW",
      });
    }
  }

  // Total de experiencia no puede superar el tiempo posible de vida laboral
  const totalYears = totalMonths / 12;
  if (totalYears > 40) {
    alerts.push({
      field: "experience",
      issue: `La suma total de experiencia laboral (${Math.round(totalYears)} años) parece imposible. Verifique superposición de fechas o errores de ingreso.`,
      severity: "CRITICAL",
    });
  }

  return alerts;
}

function checkSkillsConsistency(
  skills: ProfileToVerify["skills"],
  career: string
) {
  const alerts: VerificationResult["alerts"] = [];

  for (const skill of skills) {
    if (skill.level < 1 || skill.level > 5) {
      alerts.push({
        field: "skills",
        issue: `Nivel de habilidad "${skill.name}" (${skill.level}) está fuera del rango válido (1–5).`,
        severity: "MEDIUM",
      });
    }

    if (skill.yearsUsed && skill.yearsUsed > 30) {
      alerts.push({
        field: "skills",
        issue: `Años de uso de "${skill.name}" (${skill.yearsUsed} años) es sospechosamente alto.`,
        severity: "MEDIUM",
      });
    }

    // Habilidades "experto" con poca experiencia total
    if (skill.level === 5 && skill.yearsUsed && skill.yearsUsed < 1) {
      alerts.push({
        field: "skills",
        issue: `Nivel "Experto" en "${skill.name}" con menos de 1 año de uso declarado. Requiere evidencia de proyectos o certificaciones.`,
        severity: "MEDIUM",
      });
    }
  }

  // Verificar que el número de habilidades sea razonable
  if (skills.length > 50) {
    alerts.push({
      field: "skills",
      issue: `El candidato declara ${skills.length} habilidades, lo cual puede indicar sobre-declaración. Se recomiendan máximo 30–40 habilidades relevantes.`,
      severity: "LOW",
    });
  }

  return alerts;
}

function checkGraduationConsistency(
  graduationYear: number | null | undefined,
  admissionYear: number | null | undefined,
  graduationStatus: string,
  career: string
) {
  const alerts: VerificationResult["alerts"] = [];
  const currentYear = new Date().getFullYear();

  if (graduationYear && admissionYear) {
    const studyYears = graduationYear - admissionYear;

    // Carreras de ingeniería/medicina: 5+ años
    const isLongCareer = career.includes("Ingeniería") || career === "Medicina" || career === "Arquitectura";
    const minYears = isLongCareer ? 4 : 3;
    const maxYears = 12;

    if (studyYears < minYears) {
      alerts.push({
        field: "graduationYear",
        issue: `El tiempo de estudio declarado (${studyYears} años) parece insuficiente para la carrera de ${career}. Mínimo esperado: ${minYears} años.`,
        severity: "HIGH",
      });
    }

    if (studyYears > maxYears) {
      alerts.push({
        field: "graduationYear",
        issue: `El tiempo de estudio declarado (${studyYears} años) excede el máximo habitual (${maxYears} años). Verificar fechas.`,
        severity: "LOW",
      });
    }
  }

  if (graduationYear && graduationYear > currentYear + 6) {
    alerts.push({
      field: "graduationYear",
      issue: `Año de graduación proyectado (${graduationYear}) está muy lejano en el futuro.`,
      severity: "LOW",
    });
  }

  if (graduationStatus === "TITLED" && (!graduationYear || graduationYear > currentYear)) {
    alerts.push({
      field: "graduationStatus",
      issue: `El candidato declara estar titulado pero no especifica año de graduación válido.`,
      severity: "HIGH",
    });
  }

  return alerts;
}

// ─── Función principal de verificación ───────────────────────────────────────

export function verifyProfile(profile: ProfileToVerify): VerificationResult {
  const allAlerts: VerificationResult["alerts"] = [
    ...checkGPA(profile.gpa, profile.career),
    ...checkSalaryExpectation(profile.salaryExpectation, profile.career, profile.graduationStatus),
    ...checkExperienceTimeline(profile.experienceEntries, profile.admissionYear, profile.graduationYear),
    ...checkSkillsConsistency(profile.skills, profile.career),
    ...checkGraduationConsistency(
      profile.graduationYear,
      profile.admissionYear,
      profile.graduationStatus,
      profile.career
    ),
  ];

  const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  let overallRisk: VerificationResult["overallRisk"] = "LOW";
  const hasCritical = allAlerts.some((a) => a.severity === "CRITICAL");
  const hasHigh = allAlerts.some((a) => a.severity === "HIGH");
  const mediumCount = allAlerts.filter((a) => a.severity === "MEDIUM").length;

  if (hasCritical) overallRisk = "CRITICAL";
  else if (hasHigh) overallRisk = "HIGH";
  else if (mediumCount >= 3) overallRisk = "HIGH";
  else if (mediumCount >= 1) overallRisk = "MEDIUM";

  return {
    isValid: overallRisk !== "CRITICAL" && overallRisk !== "HIGH",
    alerts: allAlerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]),
    overallRisk,
  };
}

// ─── Calcula el puntaje de completitud del perfil ────────────────────────────

export function calculateProfileScore(profile: {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  headline?: string | null;
  summary?: string | null;
  gpa?: number | null;
  salaryExpectation?: number | null;
  skillsCount: number;
  experienceCount: number;
  educationCount: number;
  languagesCount: number;
  certificationsCount: number;
  photoUrl?: string | null;
}): number {
  let score = 0;

  // Datos básicos (30 pts)
  if (profile.firstName && profile.lastName) score += 10;
  if (profile.phone) score += 5;
  if (profile.linkedinUrl) score += 5;
  if (profile.headline) score += 5;
  if (profile.summary) score += 5;

  // Datos académicos (20 pts)
  if (profile.gpa) score += 10;
  if (profile.salaryExpectation) score += 5;
  if (profile.photoUrl) score += 5;

  // Contenido del perfil (50 pts)
  score += Math.min(20, profile.skillsCount * 2);
  score += Math.min(15, profile.experienceCount * 5);
  score += Math.min(5, profile.educationCount * 3);
  score += Math.min(5, profile.languagesCount * 2.5);
  score += Math.min(5, profile.certificationsCount * 2);

  return Math.min(100, Math.round(score));
}
