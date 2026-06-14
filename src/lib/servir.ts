/**
 * Servicio de Integración con SERVIR
 *
 * SERVIR (Autoridad Nacional del Servicio Civil) publica convocatorias
 * del Estado peruano. Este servicio:
 * 1. Obtiene convocatorias desde el portal de SERVIR / gob.pe
 * 2. Filtra las relevantes según el perfil del estudiante
 * 3. Envía alertas por correo electrónico personalizadas
 *
 * Nota: Para producción usar la API oficial de gob.pe/servir o scraping ético.
 * En este prototipo se simula la integración con datos reales de ejemplo.
 */

import nodemailer from "nodemailer";
import type { ServirJob } from "./types";

// ─── Configuración de email ───────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Dataset simulado SERVIR (demo hackathon) ─────────────────────────────────
// Convocatorias representativas de instituciones reales del Estado peruano.
// Cubren las 52 carreras de la UNSA. En producción se reemplaza con fetch
// a https://talento.servir.gob.pe o la API pública de gob.pe/servir.

export const SERVIR_DEMO_JOBS: ServirJob[] = [
  // ── INGENIERÍAS CIVILES Y CONSTRUCCIÓN ────────────────────────────────────
  {
    title: "Especialista en Infraestructura Vial",
    institution: "Ministerio de Transportes y Comunicaciones (MTC)",
    url: "https://talento.servir.gob.pe/convocatoria/24001",
    salary: "S/ 5,500 - S/ 7,200",
    location: "Arequipa",
    deadline: "2026-07-18",
    requirements: "Ingeniería Civil, 3 años de experiencia en diseño vial, manejo de AutoCAD y Civil 3D",
    tags: ["Ingeniería Civil", "Infraestructura"],
  },
  {
    title: "Supervisor de Obras de Saneamiento",
    institution: "Autoridad Nacional del Agua (ANA)",
    url: "https://talento.servir.gob.pe/convocatoria/24002",
    salary: "S/ 4,800 - S/ 6,500",
    location: "Arequipa",
    deadline: "2026-07-25",
    requirements: "Ingeniería Civil o Ingeniería Sanitaria, experiencia en proyectos de agua potable y alcantarillado",
    tags: ["Ingeniería Civil", "Ingeniería Sanitaria"],
  },
  {
    title: "Proyectista de Vivienda Social",
    institution: "Ministerio de Vivienda, Construcción y Saneamiento",
    url: "https://talento.servir.gob.pe/convocatoria/24003",
    salary: "S/ 4,200 - S/ 5,800",
    location: "Lima / Arequipa",
    deadline: "2026-08-10",
    requirements: "Ingeniería Civil o Arquitectura, conocimiento en Reglamento Nacional de Edificaciones (RNE)",
    tags: ["Ingeniería Civil", "Arquitectura"],
  },

  // ── SISTEMAS E INFORMÁTICA ────────────────────────────────────────────────
  {
    title: "Desarrollador de Sistemas de Información",
    institution: "Registro Nacional de Identificación y Estado Civil (RENIEC)",
    url: "https://talento.servir.gob.pe/convocatoria/24004",
    salary: "S/ 4,500 - S/ 6,000",
    location: "Lima",
    deadline: "2026-07-14",
    requirements: "Ingeniería de Sistemas o Ciencia de la Computación, experiencia en Java, Spring Boot y PostgreSQL",
    tags: ["Ingeniería de Sistemas", "Ciencia de la Computación"],
  },
  {
    title: "Analista de Ciberseguridad",
    institution: "Secretaría de Gobierno y Transformación Digital (PCM)",
    url: "https://talento.servir.gob.pe/convocatoria/24005",
    salary: "S/ 5,800 - S/ 8,000",
    location: "Lima",
    deadline: "2026-07-22",
    requirements: "Ingeniería de Sistemas, Ciencia de la Computación o Ingeniería Electrónica; certificación CEH o CISSP deseable",
    tags: ["Ingeniería de Sistemas", "Ciencia de la Computación", "Ingeniería Electrónica"],
  },
  {
    title: "Especialista en Inteligencia Artificial para el Estado",
    institution: "Instituto Nacional de Estadística e Informática (INEI)",
    url: "https://talento.servir.gob.pe/convocatoria/24006",
    salary: "S/ 5,200 - S/ 7,500",
    location: "Lima / Arequipa",
    deadline: "2026-08-05",
    requirements: "Ingeniería de Sistemas, Ciencia de la Computación o Matemáticas; experiencia en Python, Machine Learning y análisis de datos",
    tags: ["Ingeniería de Sistemas", "Ciencia de la Computación", "Matemáticas"],
  },
  {
    title: "Administrador de Infraestructura TI",
    institution: "Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)",
    url: "https://talento.servir.gob.pe/convocatoria/24007",
    salary: "S/ 4,000 - S/ 5,500",
    location: "Arequipa",
    deadline: "2026-07-10",
    requirements: "Ingeniería de Sistemas o afines, experiencia en administración de servidores Linux, AWS o Azure",
    tags: ["Ingeniería de Sistemas", "Ingeniería en Telecomunicaciones"],
  },

  // ── MEDIO AMBIENTE Y ECOLOGÍA ─────────────────────────────────────────────
  {
    title: "Especialista en Evaluación de Impacto Ambiental",
    institution: "Organismo de Evaluación y Fiscalización Ambiental (OEFA)",
    url: "https://talento.servir.gob.pe/convocatoria/24008",
    salary: "S/ 4,500 - S/ 6,200",
    location: "Lima / Arequipa",
    deadline: "2026-07-28",
    requirements: "Ingeniería Ambiental, Biología o Ingeniería Química; experiencia en estudios de impacto ambiental",
    tags: ["Ingeniería Ambiental", "Biología", "Ingeniería Química"],
  },
  {
    title: "Analista de Cambio Climático",
    institution: "Ministerio del Ambiente (MINAM)",
    url: "https://talento.servir.gob.pe/convocatoria/24009",
    salary: "S/ 4,000 - S/ 5,500",
    location: "Lima",
    deadline: "2026-08-15",
    requirements: "Ingeniería Ambiental, Biología, Física o Química; conocimiento en modelos climáticos y GIS",
    tags: ["Ingeniería Ambiental", "Biología", "Física", "Química"],
  },
  {
    title: "Especialista en Gestión de Recursos Hídricos",
    institution: "Autoridad Nacional del Agua (ANA)",
    url: "https://talento.servir.gob.pe/convocatoria/24010",
    salary: "S/ 4,200 - S/ 5,800",
    location: "Arequipa",
    deadline: "2026-07-20",
    requirements: "Ingeniería Ambiental, Ingeniería Sanitaria, Ingeniería Civil o Biología; manejo de ArcGIS",
    tags: ["Ingeniería Ambiental", "Ingeniería Sanitaria", "Ingeniería Civil", "Biología"],
  },

  // ── MINERÍA Y GEOLOGÍA ────────────────────────────────────────────────────
  {
    title: "Fiscal de Minería",
    institution: "Ministerio de Energía y Minas (MINEM)",
    url: "https://talento.servir.gob.pe/convocatoria/24011",
    salary: "S/ 6,500 - S/ 9,000",
    location: "Lima / Arequipa",
    deadline: "2026-07-30",
    requirements: "Ingeniería de Minas, Ingeniería Geológica o Ingeniería Metalúrgica; 3 años en fiscalización minera",
    tags: ["Ingeniería de Minas", "Ingeniería Geológica", "Ingeniería Metalúrgica"],
  },
  {
    title: "Geólogo Explorador",
    institution: "Instituto Geológico, Minero y Metalúrgico (INGEMMET)",
    url: "https://talento.servir.gob.pe/convocatoria/24012",
    salary: "S/ 5,500 - S/ 7,800",
    location: "Arequipa",
    deadline: "2026-08-08",
    requirements: "Ingeniería Geológica o Ingeniería Geofísica; experiencia en cartografía geológica y uso de GPS diferencial",
    tags: ["Ingeniería Geológica", "Ingeniería Geofísica"],
  },
  {
    title: "Especialista en Metalurgia Extractiva",
    institution: "Empresa Activos Mineros S.A.C. (Estado)",
    url: "https://talento.servir.gob.pe/convocatoria/24013",
    salary: "S/ 5,800 - S/ 8,500",
    location: "Arequipa",
    deadline: "2026-08-01",
    requirements: "Ingeniería Metalúrgica o Ingeniería de Minas; experiencia en procesos hidrometalúrgicos y pirometalúrgicos",
    tags: ["Ingeniería Metalúrgica", "Ingeniería de Minas"],
  },

  // ── ENERGÍA Y TELECOMUNICACIONES ──────────────────────────────────────────
  {
    title: "Fiscalizador de Concesiones Eléctricas",
    institution: "Organismo Supervisor de la Inversión en Energía y Minería (OSINERGMIN)",
    url: "https://talento.servir.gob.pe/convocatoria/24014",
    salary: "S/ 5,000 - S/ 7,000",
    location: "Lima / Arequipa",
    deadline: "2026-07-16",
    requirements: "Ingeniería Eléctrica o Ingeniería Electrónica; conocimiento del Marco Legal del Sector Eléctrico",
    tags: ["Ingeniería Eléctrica", "Ingeniería Electrónica"],
  },
  {
    title: "Especialista en Espectro Radioeléctrico",
    institution: "Organismo Supervisor de Inversión Privada en Telecomunicaciones (OSIPTEL)",
    url: "https://talento.servir.gob.pe/convocatoria/24015",
    salary: "S/ 4,800 - S/ 6,500",
    location: "Lima",
    deadline: "2026-07-24",
    requirements: "Ingeniería en Telecomunicaciones, Ingeniería Electrónica o afines; experiencia en regulación de telecomunicaciones",
    tags: ["Ingeniería en Telecomunicaciones", "Ingeniería Electrónica"],
  },
  {
    title: "Proyectista de Redes Eléctricas Rurales",
    institution: "Gobierno Regional de Arequipa – Gerencia de Energía",
    url: "https://talento.servir.gob.pe/convocatoria/24016",
    salary: "S/ 4,000 - S/ 5,500",
    location: "Arequipa",
    deadline: "2026-08-12",
    requirements: "Ingeniería Eléctrica o Ingeniería Mecánica; experiencia en diseño de redes de distribución eléctrica",
    tags: ["Ingeniería Eléctrica", "Ingeniería Mecánica"],
  },

  // ── ADMINISTRACIÓN, CONTABILIDAD Y FINANZAS ───────────────────────────────
  {
    title: "Analista de Presupuesto Público",
    institution: "Ministerio de Economía y Finanzas (MEF)",
    url: "https://talento.servir.gob.pe/convocatoria/24017",
    salary: "S/ 4,200 - S/ 6,000",
    location: "Lima",
    deadline: "2026-07-18",
    requirements: "Economía, Administración, Contabilidad o Finanzas; manejo de SIAF y conocimiento del Sistema Nacional de Presupuesto",
    tags: ["Economía", "Administración", "Contabilidad", "Finanzas"],
  },
  {
    title: "Auditor Gubernamental Junior",
    institution: "Contraloría General de la República",
    url: "https://talento.servir.gob.pe/convocatoria/24018",
    salary: "S/ 3,800 - S/ 5,200",
    location: "Arequipa",
    deadline: "2026-07-26",
    requirements: "Contabilidad o Administración; conocimiento en auditoría gubernamental y Normas de Auditoría Gubernamental (NAGU)",
    tags: ["Contabilidad", "Administración"],
  },
  {
    title: "Especialista en Banca y Seguros",
    institution: "Superintendencia de Banca y Seguros y AFP (SBS)",
    url: "https://talento.servir.gob.pe/convocatoria/24019",
    salary: "S/ 4,500 - S/ 6,800",
    location: "Lima",
    deadline: "2026-08-02",
    requirements: "Economía, Finanzas, Banca y Seguros o afines; conocimiento en regulación financiera y gestión de riesgos",
    tags: ["Economía", "Finanzas", "Banca y Seguros"],
  },
  {
    title: "Gestor de Logística y Adquisiciones",
    institution: "Gobierno Regional de Arequipa – Área de Abastecimiento",
    url: "https://talento.servir.gob.pe/convocatoria/24020",
    salary: "S/ 3,200 - S/ 4,500",
    location: "Arequipa",
    deadline: "2026-07-08",
    requirements: "Administración, Gestión o Ingeniería Industrial; experiencia en SIGA y Ley de Contrataciones del Estado",
    tags: ["Administración", "Gestión", "Ingeniería Industrial"],
  },

  // ── DERECHO ───────────────────────────────────────────────────────────────
  {
    title: "Asesor Legal en Contrataciones del Estado",
    institution: "Organismo Supervisor de las Contrataciones del Estado (OSCE)",
    url: "https://talento.servir.gob.pe/convocatoria/24021",
    salary: "S/ 4,500 - S/ 6,500",
    location: "Lima / Arequipa",
    deadline: "2026-07-22",
    requirements: "Derecho, colegiado y habilitado; especialización en contrataciones del Estado o Derecho Administrativo",
    tags: ["Derecho"],
  },
  {
    title: "Defensor del Ciudadano – Defensoría del Pueblo",
    institution: "Defensoría del Pueblo",
    url: "https://talento.servir.gob.pe/convocatoria/24022",
    salary: "S/ 3,500 - S/ 5,000",
    location: "Arequipa",
    deadline: "2026-08-01",
    requirements: "Derecho o Sociología; experiencia en derechos humanos o trabajo comunitario",
    tags: ["Derecho", "Sociología", "Trabajo Social"],
  },

  // ── SALUD ─────────────────────────────────────────────────────────────────
  {
    title: "Médico Cirujano – Atención Primaria",
    institution: "Ministerio de Salud (MINSA) – Arequipa",
    url: "https://talento.servir.gob.pe/convocatoria/24023",
    salary: "S/ 6,000 - S/ 9,500",
    location: "Arequipa",
    deadline: "2026-07-15",
    requirements: "Medicina; colegiado y habilitado; disponibilidad para zonas rurales de Arequipa",
    tags: ["Medicina"],
  },
  {
    title: "Enfermero/a Especialista en Emergencias",
    institution: "EsSalud – Hospital Nacional Carlos Alberto Seguín Escobedo",
    url: "https://talento.servir.gob.pe/convocatoria/24024",
    salary: "S/ 3,500 - S/ 5,200",
    location: "Arequipa",
    deadline: "2026-07-20",
    requirements: "Enfermería; colegiada y habilitada; experiencia en servicios de emergencia hospitalaria",
    tags: ["Enfermería"],
  },
  {
    title: "Nutricionista para Programa Alimentario",
    institution: "Programa Nacional de Alimentación Escolar Qali Warma",
    url: "https://talento.servir.gob.pe/convocatoria/24025",
    salary: "S/ 2,800 - S/ 4,000",
    location: "Arequipa / Puno",
    deadline: "2026-07-12",
    requirements: "Ciencias de la Nutrición; experiencia en programas de alimentación colectiva y atención de zonas vulnerables",
    tags: ["Ciencias de la Nutrición"],
  },
  {
    title: "Psicólogo Clínico y Comunitario",
    institution: "Ministerio de Desarrollo e Inclusión Social (MIDIS)",
    url: "https://talento.servir.gob.pe/convocatoria/24026",
    salary: "S/ 3,000 - S/ 4,500",
    location: "Arequipa",
    deadline: "2026-07-30",
    requirements: "Psicología; colegiado y habilitado; experiencia en atención de poblaciones vulnerables y salud mental comunitaria",
    tags: ["Psicología"],
  },

  // ── CIENCIAS SOCIALES Y HUMANIDADES ──────────────────────────────────────
  {
    title: "Especialista en Inclusión Social",
    institution: "Ministerio de Desarrollo e Inclusión Social (MIDIS)",
    url: "https://talento.servir.gob.pe/convocatoria/24027",
    salary: "S/ 3,200 - S/ 4,500",
    location: "Arequipa / Puno",
    deadline: "2026-07-25",
    requirements: "Trabajo Social, Sociología o Antropología; experiencia en trabajo con comunidades andinas y mapeo social",
    tags: ["Trabajo Social", "Sociología", "Antropología"],
  },
  {
    title: "Gestor Cultural Patrimonial",
    institution: "Ministerio de Cultura – Dirección Desconcentrada de Arequipa",
    url: "https://talento.servir.gob.pe/convocatoria/24028",
    salary: "S/ 3,000 - S/ 4,200",
    location: "Arequipa",
    deadline: "2026-08-08",
    requirements: "Historia, Antropología, Artes o Literatura y Lingüística; experiencia en gestión de patrimonio cultural inmaterial",
    tags: ["Historia", "Antropología", "Artes Plásticas", "Música", "Literatura y Lingüística"],
  },
  {
    title: "Relacionista Comunitario",
    institution: "Gobierno Regional de Arequipa – Gerencia de Desarrollo Social",
    url: "https://talento.servir.gob.pe/convocatoria/24029",
    salary: "S/ 2,800 - S/ 3,800",
    location: "Arequipa",
    deadline: "2026-07-18",
    requirements: "Relaciones Públicas, Sociología, Trabajo Social o Comunicaciones; manejo de quechua deseable",
    tags: ["Relaciones Públicas", "Sociología", "Trabajo Social", "Periodismo"],
  },

  // ── ECONOMÍA Y CIENCIAS FORMALES ─────────────────────────────────────────
  {
    title: "Economista Analista Macroeconómico",
    institution: "Banco Central de Reserva del Perú (BCRP)",
    url: "https://talento.servir.gob.pe/convocatoria/24030",
    salary: "S/ 5,500 - S/ 8,000",
    location: "Lima",
    deadline: "2026-08-01",
    requirements: "Economía o Matemáticas; manejo avanzado de R, Python y Stata; inglés avanzado deseable",
    tags: ["Economía", "Matemáticas"],
  },
  {
    title: "Estadístico para Encuestas Nacionales",
    institution: "Instituto Nacional de Estadística e Informática (INEI)",
    url: "https://talento.servir.gob.pe/convocatoria/24031",
    salary: "S/ 4,000 - S/ 5,800",
    location: "Lima / Arequipa",
    deadline: "2026-07-22",
    requirements: "Matemáticas, Estadística, Economía o Ciencia de la Computación; experiencia en muestreo y análisis de encuestas",
    tags: ["Matemáticas", "Economía", "Ciencia de la Computación"],
  },
  {
    title: "Investigador en Física Atmosférica",
    institution: "Servicio Nacional de Meteorología e Hidrología (SENAMHI)",
    url: "https://talento.servir.gob.pe/convocatoria/24032",
    salary: "S/ 4,200 - S/ 5,800",
    location: "Arequipa",
    deadline: "2026-07-28",
    requirements: "Física, Ingeniería Ambiental o Matemáticas; experiencia en modelamiento numérico atmosférico y programación en Python/Fortran",
    tags: ["Física", "Ingeniería Ambiental", "Matemáticas"],
  },

  // ── EDUCACIÓN ─────────────────────────────────────────────────────────────
  {
    title: "Especialista en Currículo Nacional",
    institution: "Ministerio de Educación (MINEDU)",
    url: "https://talento.servir.gob.pe/convocatoria/24033",
    salary: "S/ 3,500 - S/ 5,000",
    location: "Lima",
    deadline: "2026-07-20",
    requirements: "Educación con mención en currículo o pedagogía; 3 años de experiencia en diseño curricular",
    tags: ["Educación"],
  },

  // ── INDUSTRIA ALIMENTARIA Y AGRONOMÍA ────────────────────────────────────
  {
    title: "Inspector de Inocuidad Alimentaria",
    institution: "Servicio Nacional de Sanidad Agraria (SENASA)",
    url: "https://talento.servir.gob.pe/convocatoria/24034",
    salary: "S/ 3,800 - S/ 5,200",
    location: "Arequipa",
    deadline: "2026-07-15",
    requirements: "Ingeniería de Industrias Alimentarias, Ingeniería Química, Ciencias de la Nutrición o Biología; experiencia en BPM y HACCP",
    tags: ["Ingeniería de Industrias Alimentarias", "Ingeniería Química", "Ciencias de la Nutrición", "Biología"],
  },
  {
    title: "Especialista Agrícola para Sierra Sur",
    institution: "Ministerio de Desarrollo Agrario y Riego (MIDAGRI)",
    url: "https://talento.servir.gob.pe/convocatoria/24035",
    salary: "S/ 3,500 - S/ 4,800",
    location: "Arequipa / Moquegua",
    deadline: "2026-08-05",
    requirements: "Agronomía o Ingeniería Agrícola; experiencia en cultivos de sierra y sistemas de riego tecnificado",
    tags: ["Agronomía"],
  },
  {
    title: "Biólogo Marino – Investigación Pesquera",
    institution: "Instituto del Mar del Perú (IMARPE)",
    url: "https://talento.servir.gob.pe/convocatoria/24036",
    salary: "S/ 4,200 - S/ 5,800",
    location: "Lima / Ilo",
    deadline: "2026-07-28",
    requirements: "Biología con especialidad marina o Ingeniería Pesquera; experiencia en monitoreo de recursos hidrobiológicos",
    tags: ["Biología", "Ingeniería Pesquera"],
  },

  // ── INGENIERÍA INDUSTRIAL Y MATERIALES ───────────────────────────────────
  {
    title: "Especialista en Optimización de Procesos Productivos",
    institution: "Ministerio de la Producción (PRODUCE)",
    url: "https://talento.servir.gob.pe/convocatoria/24037",
    salary: "S/ 4,500 - S/ 6,200",
    location: "Lima / Arequipa",
    deadline: "2026-07-22",
    requirements: "Ingeniería Industrial, Ingeniería Mecánica o Ingeniería Química; experiencia en Lean Manufacturing o Six Sigma",
    tags: ["Ingeniería Industrial", "Ingeniería Mecánica", "Ingeniería Química"],
  },
  {
    title: "Investigador en Nuevos Materiales",
    institution: "Consejo Nacional de Ciencia, Tecnología e Innovación (CONCYTEC)",
    url: "https://talento.servir.gob.pe/convocatoria/24038",
    salary: "S/ 4,800 - S/ 7,000",
    location: "Lima",
    deadline: "2026-08-15",
    requirements: "Ingeniería de Materiales, Ingeniería Química, Física o Química; experiencia en laboratorio y publicaciones académicas",
    tags: ["Ingeniería de Materiales", "Ingeniería Química", "Física", "Química"],
  },

  // ── TURISMO Y MARKETING ───────────────────────────────────────────────────
  {
    title: "Promotor de Turismo Vivencial – Sierra",
    institution: "Comisión de Promoción del Perú para la Exportación y el Turismo (PromPerú)",
    url: "https://talento.servir.gob.pe/convocatoria/24039",
    salary: "S/ 2,800 - S/ 4,000",
    location: "Arequipa / Cusco",
    deadline: "2026-07-14",
    requirements: "Turismo y Hotelería, Marketing o Administración; inglés intermedio; experiencia en gestión de destinos turísticos",
    tags: ["Turismo y Hotelería", "Marketing", "Administración"],
  },

  // ── RELACIONES INDUSTRIALES ───────────────────────────────────────────────
  {
    title: "Especialista en Relaciones Laborales",
    institution: "Ministerio de Trabajo y Promoción del Empleo (MTPE)",
    url: "https://talento.servir.gob.pe/convocatoria/24040",
    salary: "S/ 3,500 - S/ 5,000",
    location: "Arequipa",
    deadline: "2026-07-30",
    requirements: "Relaciones Industriales, Administración o Derecho; conocimiento de legislación laboral peruana",
    tags: ["Relaciones Industriales", "Administración", "Derecho"],
  },

  // ── RELACIONES INTERNACIONALES Y COMUNICACIONES ───────────────────────────
  {
    title: "Analista de Prensa y Comunicación Gubernamental",
    institution: "Oficina Nacional de Gobierno Interior (ONAGI)",
    url: "https://talento.servir.gob.pe/convocatoria/24041",
    salary: "S/ 3,000 - S/ 4,200",
    location: "Arequipa",
    deadline: "2026-07-18",
    requirements: "Periodismo, Relaciones Públicas o Comunicación Social; experiencia en redacción institucional y manejo de redes sociales",
    tags: ["Periodismo", "Relaciones Públicas"],
  },
  {
    title: "Especialista en Cooperación Internacional",
    institution: "Agencia Peruana de Cooperación Internacional (APCI)",
    url: "https://talento.servir.gob.pe/convocatoria/24042",
    salary: "S/ 4,000 - S/ 5,500",
    location: "Lima",
    deadline: "2026-08-10",
    requirements: "Economía, Administración o afines; inglés avanzado; experiencia en formulación de proyectos de cooperación técnica",
    tags: ["Economía", "Administración", "Relaciones Públicas"],
  },

  // ── INGENIERÍA SANITARIA Y QUÍMICA ───────────────────────────────────────
  {
    title: "Especialista en Calidad de Agua y Saneamiento",
    institution: "Superintendencia Nacional de Servicios de Saneamiento (SUNASS)",
    url: "https://talento.servir.gob.pe/convocatoria/24043",
    salary: "S/ 4,000 - S/ 5,800",
    location: "Lima / Arequipa",
    deadline: "2026-07-24",
    requirements: "Ingeniería Sanitaria, Ingeniería Ambiental o Ingeniería Química; experiencia en normativa de agua potable",
    tags: ["Ingeniería Sanitaria", "Ingeniería Ambiental", "Ingeniería Química"],
  },
  {
    title: "Químico Analista de Laboratorio",
    institution: "Dirección General de Salud Ambiental e Inocuidad Alimentaria (DIGESA)",
    url: "https://talento.servir.gob.pe/convocatoria/24044",
    salary: "S/ 3,500 - S/ 4,800",
    location: "Lima",
    deadline: "2026-07-16",
    requirements: "Química, Ingeniería Química o Biología; experiencia en análisis fisicoquímico y microbiológico; manejo de LIMS",
    tags: ["Química", "Ingeniería Química", "Biología"],
  },

  // ── FILOSOFÍA Y LITERATURA ────────────────────────────────────────────────
  {
    title: "Especialista en Derechos de Autor y Propiedad Intelectual",
    institution: "Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)",
    url: "https://talento.servir.gob.pe/convocatoria/24045",
    salary: "S/ 3,500 - S/ 5,000",
    location: "Lima",
    deadline: "2026-08-05",
    requirements: "Derecho, Filosofía o Literatura y Lingüística; conocimiento en propiedad intelectual y derecho comparado",
    tags: ["Derecho", "Filosofía", "Literatura y Lingüística"],
  },
];

// ─── Filtrado de empleos según perfil ────────────────────────────────────────
// Usa el campo `tags` del dataset simulado para un matching exacto y limpio.

export function filterJobsForStudent(
  studentCareer: string,
  studentSkills: string[],
  jobs: ServirJob[] = SERVIR_DEMO_JOBS
): ServirJob[] {
  const careerLower = studentCareer.toLowerCase();
  const skillsLower = studentSkills.map((s) => s.toLowerCase());

  return jobs.filter((job) => {
    // Coincidencia por tags (campo estructurado del dataset simulado)
    const tagMatch = (job as ServirJob & { tags?: string[] }).tags?.some(
      (tag) => tag.toLowerCase() === careerLower
    );

    // Coincidencia por texto libre en requisitos
    const reqLower = job.requirements.toLowerCase();
    const textMatch = reqLower.includes(careerLower);

    // Coincidencia por habilidades del estudiante
    const skillMatch = skillsLower.some((skill) => reqLower.includes(skill));

    return tagMatch || textMatch || skillMatch;
  });
}

// ─── Obtener todas las convocatorias (para vista demo) ───────────────────────

export function getAllServirJobs(): ServirJob[] {
  return SERVIR_DEMO_JOBS;
}

// ─── Fetch de SERVIR (producción) ────────────────────────────────────────────

export async function fetchServirJobs(career: string): Promise<ServirJob[]> {
  // En producción: integrar con https://www.gob.pe/institucion/servir/convocatorias-cas
  return filterJobsForStudent(career, []);
}

// ─── Envío de alerta por email ────────────────────────────────────────────────

export async function sendJobAlert(
  studentEmail: string,
  studentName: string,
  jobs: ServirJob[]
): Promise<void> {
  if (jobs.length === 0) return;

  const jobsList = jobs
    .slice(0, 5)
    .map(
      (job, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"}">
        <td style="padding:12px 16px">
          <strong style="color:#A50021">${job.title}</strong><br/>
          <span style="color:#6b7280;font-size:14px">${job.institution}</span>
        </td>
        <td style="padding:12px 16px;color:#374151">${job.salary ?? "No especificado"}</td>
        <td style="padding:12px 16px;color:#374151">${job.location}</td>
        <td style="padding:12px 16px;color:#374151">${job.deadline ?? "Sin fecha límite"}</td>
        <td style="padding:12px 16px">
          <a href="${job.url}" style="background:#A50021;color:white;padding:6px 14px;border-radius:6px;text-decoration:none;font-size:13px">Ver</a>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:Inter,sans-serif;background:#f3f4f6;margin:0;padding:20px">
  <div style="max-width:700px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07)">

    <div style="background:#A50021;padding:28px 32px;text-align:center">
      <h1 style="color:white;margin:0;font-size:22px">🎓 UNSA Career Connect</h1>
      <p style="color:#fde8ee;margin:6px 0 0;font-size:14px">Bolsa de Trabajo · Universidad Nacional de San Agustín</p>
    </div>

    <div style="padding:28px 32px">
      <h2 style="color:#111827;margin:0 0 8px">Hola, ${studentName} 👋</h2>
      <p style="color:#6b7280;margin:0 0 24px">
        Encontramos <strong>${jobs.length} nueva(s) oportunidad(es) del Estado</strong> (SERVIR)
        que coinciden con tu perfil. ¡No dejes pasar estas convocatorias!
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#fef2f2">
            <th style="padding:12px 16px;text-align:left;color:#A50021;font-size:13px">Puesto</th>
            <th style="padding:12px 16px;text-align:left;color:#A50021;font-size:13px">Sueldo</th>
            <th style="padding:12px 16px;text-align:left;color:#A50021;font-size:13px">Lugar</th>
            <th style="padding:12px 16px;text-align:left;color:#A50021;font-size:13px">Cierre</th>
            <th style="padding:12px 16px;text-align:left;color:#A50021;font-size:13px">Enlace</th>
          </tr>
        </thead>
        <tbody>${jobsList}</tbody>
      </table>

      <div style="margin-top:28px;padding:16px;background:#fef2f2;border-radius:8px;border-left:4px solid #A50021">
        <p style="margin:0;color:#374151;font-size:14px">
          💡 <strong>Tip:</strong> Actualiza tu perfil verificado en la Bolsa de Trabajo UNSA para que
          las empresas te encuentren más fácilmente.
        </p>
      </div>
    </div>

    <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0;color:#9ca3af;font-size:12px">
        UNSA Career Connect · UDEEG · Universidad Nacional de San Agustín de Arequipa<br/>
        <a href="#" style="color:#A50021;text-decoration:none">Gestionar alertas</a> ·
        <a href="#" style="color:#A50021;text-decoration:none">Ir al portal</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: studentEmail,
    subject: `🎯 ${jobs.length} nueva(s) oportunidad(es) SERVIR para tu perfil – UNSA Career Connect`,
    html,
  });
}

// ─── Alerta masiva para todos los estudiantes verificados ────────────────────

export async function dispatchServirAlerts(
  students: { id: string; email: string; name: string; career: string; skills: string[] }[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const student of students) {
    try {
      const jobs = filterJobsForStudent(student.career, student.skills);
      if (jobs.length > 0) {
        await sendJobAlert(student.email, student.name, jobs);
        sent++;
      }
    } catch {
      failed++;
    }
    // Rate limit: 1 email cada 200ms
    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent, failed };
}
