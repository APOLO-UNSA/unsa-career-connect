// ─── Careers & Faculties ──────────────────────────────────────────────────────

export const FACULTIES = [
  "Administración",
  "Agronomía",
  "Arquitectura y Urbanismo",
  "Ciencias Biológicas y Agropecuarias",
  "Ciencias Contables y Financieras",
  "Ciencias de la Educación",
  "Ciencias Histórico Sociales",
  "Ciencias Jurídicas y Políticas",
  "Ciencias Médicas",
  "Ciencias Naturales y Formales",
  "Economía",
  "Enfermería",
  "Filosofía y Humanidades",
  "Geología, Geofísica y Minas",
  "Ingeniería de Procesos",
  "Ingeniería de Producción y Servicios",
  "Ingeniería Eléctrica y Electrónica",
  "Psicología, Relaciones Industriales y Ciencias de la Comunicación",
] as const;

export const CAREERS: Record<string, string[]> = {
  "Administración": ["Administración", "Banca y Seguros", "Marketing", "Gestión"],
  "Arquitectura y Urbanismo": ["Arquitectura"],
  "Ciencias Biológicas y Agropecuarias": ["Agronomía", "Biología", "Ciencias de la Nutrición", "Ingeniería Pesquera"],
  "Ciencias Contables y Financieras": ["Contabilidad", "Finanzas"],
  "Ciencias de la Educación": ["Educación"],
  "Ciencias Histórico Sociales": ["Antropología", "Historia", "Sociología", "Trabajo Social", "Turismo y Hotelería"],
  "Ciencias Jurídicas y Políticas": ["Derecho"],
  "Ciencias Médicas": ["Medicina"],
  "Ciencias Naturales y Formales": ["Física", "Química", "Matemáticas"],
  "Economía": ["Economía"],
  "Enfermería": ["Enfermería"],
  "Filosofía y Humanidades": ["Artes", "Filosofía", "Literatura y Lingüística"],
  "Geología, Geofísica y Minas": ["Ingeniería Geológica", "Ingeniería Geofísica", "Ingeniería de Minas"],
  "Ingeniería de Procesos": ["Ingeniería Civil", "Ingeniería Sanitaria", "Ingeniería Metalúrgica", "Ingeniería Química", "Ingeniería de Industrias Alimentarias", "Ingeniería de Materiales", "Ingeniería Ambiental"],
  "Ingeniería de Producción y Servicios": ["Ingeniería Industrial", "Ingeniería de Sistemas", "Ciencia de la Computación"],
  "Ingeniería Eléctrica y Electrónica": ["Ingeniería Eléctrica", "Ingeniería Electrónica", "Ingeniería Mecánica", "Ingeniería en Telecomunicaciones"],
  "Psicología, Relaciones Industriales y Ciencias de la Comunicación": ["Psicología", "Relaciones Industriales", "Ciencias de Comunicación"],
};

export const ALL_CAREERS = Object.values(CAREERS).flat();

// ─── Salary benchmarks por carrera (soles/mes) ────────────────────────────────

export const SALARY_BENCHMARKS: Record<string, { min: number; median: number; max: number }> = {
  "Medicina": { min: 3000, median: 7000, max: 20000 },
  "Enfermería": { min: 1800, median: 3500, max: 8000 },
  "Ingeniería de Sistemas": { min: 2500, median: 5000, max: 15000 },
  "Ciencia de la Computación": { min: 2500, median: 5500, max: 18000 },
  "Ingeniería Industrial": { min: 2500, median: 4500, max: 12000 },
  "Ingeniería Civil": { min: 2500, median: 5000, max: 15000 },
  "Ingeniería Eléctrica": { min: 2500, median: 4800, max: 12000 },
  "Ingeniería Electrónica": { min: 2500, median: 4800, max: 12000 },
  "Ingeniería Mecánica": { min: 2500, median: 4500, max: 12000 },
  "Ingeniería de Minas": { min: 3000, median: 6000, max: 18000 },
  "Ingeniería Metalúrgica": { min: 2800, median: 5500, max: 14000 },
  "Ingeniería Química": { min: 2500, median: 4500, max: 10000 },
  "Ingeniería Ambiental": { min: 2000, median: 4000, max: 10000 },
  "Administración": { min: 1500, median: 3000, max: 8000 },
  "Contabilidad": { min: 1500, median: 3000, max: 7000 },
  "Economía": { min: 1800, median: 3500, max: 8000 },
  "Derecho": { min: 1800, median: 4000, max: 15000 },
  "Psicología": { min: 1500, median: 2800, max: 7000 },
  "Arquitectura": { min: 1800, median: 3500, max: 9000 },
  "default": { min: 1025, median: 2500, max: 8000 },
};

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface ExtractedJobRequirements {
  careers: string[];
  skills: string[];
  experienceYears: number;
  salaryMin: number | null;
  salaryMax: number | null;
  modality: string | null;
  location: string | null;
  workType: string;
  additionalNotes: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  career: string;
  faculty: string;
  graduationStatus: string;
  graduationYear: number | null;
  gpa: number | null;
  salaryExpectation: number | null;
  skills: string[];
  experienceYears: number;
  availability: string;
  languages: string[];
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  headline: string | null;
  verificationStatus: string;
  profileScore: number;
}

export interface RankedCandidate extends CandidateProfile {
  matchScore: number;
  matchRank: number;
  explanation: string;
}

export interface VerificationResult {
  isValid: boolean;
  alerts: {
    field: string;
    issue: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }[];
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface ServirJob {
  title: string;
  institution: string;
  url: string;
  salary: string | null;
  location: string;
  deadline: string | null;
  requirements: string;
  tags?: string[];  // Carreras UNSA compatibles (campo del dataset simulado)
}
