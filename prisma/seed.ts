/**
 * Seed de datos para demo – UNSA Career Connect
 * Ejecutar: npm run db:seed
 *
 * Crea usuarios de demostración para presentación de la hackathon:
 *   - 1 administrador UDEEG
 *   - 2 empresas verificadas
 *   - 15 estudiantes/egresados con perfiles completos (carreras variadas)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de datos demo...");

  // ─── Admin UDEEG ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const adminUser = await db.user.upsert({
    where: { email: "admin@udeeg.unsa.edu.pe" },
    update: {},
    create: {
      email: "admin@udeeg.unsa.edu.pe",
      password: adminPassword,
      role: "ADMIN",
      admin: { create: { name: "Administrador UDEEG" } },
    },
  });
  console.log("✅ Admin creado:", adminUser.email);

  // ─── Empresas ─────────────────────────────────────────────────────────────
  const companyPassword = await bcrypt.hash("empresa1234", 10);

  await db.user.upsert({
    where: { email: "rrhh@mineroandino.pe" },
    update: {},
    create: {
      email: "rrhh@mineroandino.pe",
      password: companyPassword,
      role: "COMPANY",
      company: {
        create: {
          name: "Minero Andino S.A.",
          ruc: "20456789012",
          sector: "Minería",
          description: "Empresa minera con operaciones en el sur del Perú, especializada en extracción de cobre y plata.",
          website: "https://mineroandino.pe",
          contactEmail: "rrhh@mineroandino.pe",
          contactPhone: "054-312456",
          address: "Av. Ejército 1050, Arequipa",
          verificationStatus: "VERIFIED",
        },
      },
    },
  });

  await db.user.upsert({
    where: { email: "talento@tecnosur.com.pe" },
    update: {},
    create: {
      email: "talento@tecnosur.com.pe",
      password: companyPassword,
      role: "COMPANY",
      company: {
        create: {
          name: "TecnoSur Systems",
          ruc: "20567890123",
          sector: "Tecnología",
          description: "Empresa de desarrollo de software y consultoría TI con proyectos en todo el sur del Perú.",
          website: "https://tecnosur.com.pe",
          contactEmail: "talento@tecnosur.com.pe",
          contactPhone: "054-298765",
          address: "Calle Jerusalén 310, Arequipa",
          verificationStatus: "VERIFIED",
        },
      },
    },
  });

  console.log("✅ Empresas creadas");

  // ─── Estudiantes y Egresados de demo ──────────────────────────────────────
  const studentPassword = await bcrypt.hash("estudiante1234", 10);

  const students = [
    // 1. Ing. de Sistemas – Egresada con buen perfil
    {
      email: "maria.garcia@unsa.edu.pe",
      firstName: "María",
      lastName: "García Quispe",
      career: "Ingeniería de Sistemas",
      faculty: "Ingeniería de Producción y Servicios",
      graduationStatus: "GRADUATED",
      graduationYear: 2023,
      admissionYear: 2018,
      gpa: 15.8,
      salaryExpectation: 4000,
      salaryExpectationMax: 6000,
      headline: "Desarrolladora Full Stack | React · Node.js · PostgreSQL",
      summary: "Egresada de Ingeniería de Sistemas con 2 años de experiencia en desarrollo web. Apasionada por la innovación tecnológica y los proyectos de impacto social.",
      availability: "IMMEDIATE",
      workModality: "Híbrido",
      phone: "959123456",
      linkedinUrl: "https://linkedin.com/in/maria-garcia-unsa",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "React", category: "Software", level: 4, yearsUsed: 2 },
        { name: "Node.js", category: "Software", level: 4, yearsUsed: 2 },
        { name: "PostgreSQL", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "Python", category: "Software", level: 3, yearsUsed: 2 },
        { name: "Docker", category: "Software", level: 3, yearsUsed: 1 },
        { name: "AWS", category: "Software", level: 2, yearsUsed: 0.5 },
        { name: "TypeScript", category: "Software", level: 3, yearsUsed: 1 },
        { name: "Trabajo en equipo", category: "Blanda", level: 5, yearsUsed: 3 },
      ],
      experience: [
        {
          company: "StartUp Digital Arequipa",
          position: "Desarrolladora Full Stack Junior",
          description: "Desarrollo de plataforma e-commerce para pymes locales usando React y Node.js",
          startDate: new Date("2023-03-01"),
          endDate: new Date("2024-06-30"),
          isCurrent: false,
          salary: 2800,
        },
        {
          company: "UNSA – Proyecto VIGA",
          position: "Desarrolladora Web (Practicante)",
          description: "Desarrollo de sistema de gestión académica para la Facultad de Ingeniería",
          startDate: new Date("2022-08-01"),
          endDate: new Date("2023-02-28"),
          isCurrent: false,
          salary: 1200,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Intermedio", certified: false },
      ],
    },

    // 2. Ing. de Minas – Titulado con experiencia
    {
      email: "carlos.mamani@unsa.edu.pe",
      firstName: "Carlos",
      lastName: "Mamani Ccallo",
      career: "Ingeniería de Minas",
      faculty: "Geología, Geofísica y Minas",
      graduationStatus: "TITLED",
      graduationYear: 2021,
      admissionYear: 2015,
      gpa: 14.2,
      salaryExpectation: 6000,
      salaryExpectationMax: 9000,
      headline: "Ingeniero de Minas | Operaciones Subterráneas · Seguridad · Cerro Verde",
      summary: "Titulado con 3 años de experiencia en operaciones mineras subterráneas y a tajo abierto. Experiencia en Cerro Verde y Antapaccay.",
      availability: "IN_30_DAYS",
      workModality: "Presencial",
      phone: "962345678",
      linkedinUrl: "https://linkedin.com/in/carlos-mamani-minas",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Minería subterránea", category: "Técnica", level: 4, yearsUsed: 3 },
        { name: "Voladura de rocas", category: "Técnica", level: 4, yearsUsed: 2.5 },
        { name: "AutoCAD Mine", category: "Software", level: 3, yearsUsed: 2 },
        { name: "Seguridad minera", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "Gestión de personal", category: "Blanda", level: 3, yearsUsed: 1 },
        { name: "Desmonte y relleno", category: "Técnica", level: 3, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "Sociedad Minera Cerro Verde",
          position: "Asistente de Operaciones Mina",
          description: "Supervisión de operaciones en tajo abierto, control de perforación y voladura",
          startDate: new Date("2021-09-01"),
          endDate: null,
          isCurrent: true,
          salary: 5500,
        },
        {
          company: "Compañía Minera Ares (Hochschild)",
          position: "Practicante de Operaciones",
          description: "Prácticas en mina subterránea Arcata, turno de noche",
          startDate: new Date("2020-09-01"),
          endDate: new Date("2021-08-31"),
          isCurrent: false,
          salary: 1800,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Básico", certified: false },
      ],
    },

    // 3. Medicina – Titulada, urgente
    {
      email: "ana.flores@unsa.edu.pe",
      firstName: "Ana",
      lastName: "Flores Vargas",
      career: "Medicina",
      faculty: "Ciencias Médicas",
      graduationStatus: "TITLED",
      graduationYear: 2022,
      admissionYear: 2016,
      gpa: 16.5,
      salaryExpectation: 7000,
      salaryExpectationMax: 10000,
      headline: "Médico General | Atención Primaria · Emergencias · SERUMS 2023",
      summary: "Médico cirujano titulada con SERUMS completado en zona rural de Cusco. Lista para trabajo en hospitales públicos o privados de Arequipa.",
      availability: "IMMEDIATE",
      workModality: "Presencial",
      phone: "953456789",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Atención primaria", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Emergencias médicas", category: "Técnica", level: 4, yearsUsed: 1.5 },
        { name: "Historia clínica", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "Pediatría básica", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Comunicación con pacientes", category: "Blanda", level: 5, yearsUsed: 3 },
      ],
      experience: [
        {
          company: "Centro de Salud San Pablo – Cusco",
          position: "Médico SERUMS",
          description: "Atención médica primaria en zona rural, emergencias y salud comunitaria",
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-12-31"),
          isCurrent: false,
          salary: 5500,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Quechua", level: "Intermedio", certified: false },
      ],
    },

    // 4. Ingeniería Civil – Activo, proyectos públicos
    {
      email: "luis.quispe@unsa.edu.pe",
      firstName: "Luis",
      lastName: "Quispe Huanca",
      career: "Ingeniería Civil",
      faculty: "Ingeniería de Procesos",
      graduationStatus: "GRADUATED",
      graduationYear: 2022,
      admissionYear: 2017,
      gpa: 13.9,
      salaryExpectation: 4500,
      salaryExpectationMax: 7000,
      headline: "Ingeniero Civil | Estructuras · Infraestructura Vial · AutoCAD · SAP2000",
      summary: "Egresado con experiencia en proyectos de infraestructura pública. Participé en proyectos de saneamiento para el Gobierno Regional de Arequipa.",
      availability: "IN_30_DAYS",
      workModality: "Presencial",
      phone: "942567890",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "AutoCAD", category: "Software", level: 4, yearsUsed: 3 },
        { name: "SAP2000", category: "Software", level: 3, yearsUsed: 2 },
        { name: "Civil 3D", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "Diseño estructural", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Gestión de proyectos", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Norma E.030", category: "Técnica", level: 3, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "Gobierno Regional de Arequipa – Subgerencia de Infraestructura",
          position: "Asistente de Ingeniería",
          description: "Supervisión de obra de mejoramiento de vías y saneamiento en provincia de Camaná",
          startDate: new Date("2022-04-01"),
          endDate: new Date("2024-03-31"),
          isCurrent: false,
          salary: 3200,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
      ],
    },

    // 5. Economía – Alto GPA, perfil BCR
    {
      email: "sofia.condori@unsa.edu.pe",
      firstName: "Sofía",
      lastName: "Condori Ramos",
      career: "Economía",
      faculty: "Economía",
      graduationStatus: "TITLED",
      graduationYear: 2023,
      admissionYear: 2018,
      gpa: 17.1,
      salaryExpectation: 5000,
      salaryExpectationMax: 8000,
      headline: "Economista | Análisis Macroeconómico · Python · R · Stata · Data Science",
      summary: "Economista con distinción académica. Investigadora en macroeconomía aplicada con publicaciones en revistas indexadas. Inglés avanzado (TOEFL 98).",
      availability: "IMMEDIATE",
      workModality: "Híbrido",
      phone: "978901234",
      linkedinUrl: "https://linkedin.com/in/sofia-condori-economia",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Python", category: "Software", level: 4, yearsUsed: 3 },
        { name: "R", category: "Software", level: 5, yearsUsed: 3 },
        { name: "Stata", category: "Software", level: 4, yearsUsed: 2 },
        { name: "Econometría", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "Machine Learning", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Análisis de series temporales", category: "Técnica", level: 4, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "Banco Central de Reserva del Perú – Sede Arequipa",
          position: "Analista Económica (Practicante)",
          description: "Elaboración de reportes de coyuntura económica regional, análisis de inflación y sector externo",
          startDate: new Date("2022-06-01"),
          endDate: new Date("2023-05-31"),
          isCurrent: false,
          salary: 2500,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Avanzado", certified: true },
      ],
    },

    // 6. Derecho – Activo, sector público
    {
      email: "pedro.huanca@unsa.edu.pe",
      firstName: "Pedro",
      lastName: "Huanca Tito",
      career: "Derecho",
      faculty: "Ciencias Jurídicas y Políticas",
      graduationStatus: "TITLED",
      graduationYear: 2022,
      admissionYear: 2017,
      gpa: 14.8,
      salaryExpectation: 4000,
      salaryExpectationMax: 6000,
      headline: "Abogado | Derecho Administrativo · Contrataciones del Estado · OSCE",
      summary: "Abogado colegiado y habilitado por el Colegio de Abogados de Arequipa. Especialización en contrataciones del Estado y derecho laboral público.",
      availability: "IMMEDIATE",
      workModality: "Presencial",
      phone: "956789012",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Contrataciones del Estado", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Derecho Administrativo", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Redacción jurídica", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "SEACE (OSCE)", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "Oratoria", category: "Blanda", level: 4, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "Municipalidad Provincial de Arequipa",
          position: "Abogado de la Oficina de Asesoría Legal",
          description: "Revisión de contratos, atención de consultas legales y elaboración de informes jurídicos",
          startDate: new Date("2022-07-01"),
          endDate: null,
          isCurrent: true,
          salary: 3800,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Básico", certified: false },
      ],
    },

    // 7. Ing. Ambiental – Con alerta de verificación (demo)
    {
      email: "rosa.apaza@unsa.edu.pe",
      firstName: "Rosa",
      lastName: "Apaza Chávez",
      career: "Ingeniería Ambiental",
      faculty: "Ingeniería de Procesos",
      graduationStatus: "GRADUATED",
      graduationYear: 2024,
      admissionYear: 2019,
      gpa: 15.2,
      salaryExpectation: 3500,
      salaryExpectationMax: 5000,
      headline: "Ing. Ambiental | EIA · SIG/GIS · Gestión de Residuos",
      summary: "Egresada interesada en proyectos de evaluación ambiental para el sector minero y estatal. Manejo de ArcGIS y AutoCAD.",
      availability: "IMMEDIATE",
      workModality: "Presencial",
      phone: "934567890",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "ArcGIS", category: "Software", level: 4, yearsUsed: 2 },
        { name: "Evaluación de Impacto Ambiental", category: "Técnica", level: 4, yearsUsed: 1.5 },
        { name: "Gestión de residuos sólidos", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Monitoreo de calidad de agua", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "AutoCAD", category: "Software", level: 2, yearsUsed: 1 },
      ],
      experience: [
        {
          company: "OEFA – Arequipa",
          position: "Apoyo Técnico en Fiscalización",
          description: "Apoyo en supervisiones de campo a unidades mineras en Arequipa y Puno",
          startDate: new Date("2023-09-01"),
          endDate: new Date("2024-08-31"),
          isCurrent: false,
          salary: 2800,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Intermedio", certified: false },
      ],
    },

    // 8. Ciencia de la Computación – Perfil de alto impacto
    {
      email: "diego.ccopa@unsa.edu.pe",
      firstName: "Diego",
      lastName: "Ccopa Ticona",
      career: "Ciencia de la Computación",
      faculty: "Ingeniería de Producción y Servicios",
      graduationStatus: "ACTIVE",
      graduationYear: 2025,
      admissionYear: 2020,
      gpa: 16.9,
      salaryExpectation: 3500,
      salaryExpectationMax: 5500,
      headline: "Estudiante de último año | Machine Learning · Python · Investigación",
      summary: "Estudiante de 5.° año con publicación en conferencia IEEE. Desarrollé un modelo de detección de enfermedades pulmonares con deep learning.",
      availability: "INTERNSHIP_ONLY",
      workModality: "Remoto",
      phone: "912345678",
      linkedinUrl: "https://linkedin.com/in/diego-ccopa-cs",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Python", category: "Software", level: 5, yearsUsed: 3 },
        { name: "TensorFlow", category: "Software", level: 4, yearsUsed: 2 },
        { name: "Machine Learning", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Algoritmos", category: "Técnica", level: 5, yearsUsed: 4 },
        { name: "Java", category: "Software", level: 3, yearsUsed: 2 },
        { name: "LaTeX", category: "Software", level: 4, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "UNSA – Laboratorio de Inteligencia Artificial",
          position: "Investigador (Joven Investigador CONCYTEC)",
          description: "Proyecto: clasificación de imágenes médicas con CNNs para detección de tuberculosis pulmonar",
          startDate: new Date("2023-04-01"),
          endDate: null,
          isCurrent: true,
          salary: 1500,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Avanzado", certified: true },
      ],
    },

    // 9. Contabilidad
    {
      email: "lucia.pinto@unsa.edu.pe",
      firstName: "Lucía",
      lastName: "Pinto Salas",
      career: "Contabilidad",
      faculty: "Ciencias Contables y Financieras",
      graduationStatus: "TITLED",
      graduationYear: 2021,
      admissionYear: 2016,
      gpa: 14.5,
      salaryExpectation: 3000,
      salaryExpectationMax: 4500,
      headline: "Contadora Pública | Auditoría · SUNAT · NIIF · ERP SAP",
      summary: "Contadora pública colegiada con experiencia en auditoría interna y asesoría tributaria a pymes.",
      availability: "IN_60_DAYS",
      workModality: "Presencial",
      phone: "945678901",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Auditoría interna", category: "Técnica", level: 4, yearsUsed: 2.5 },
        { name: "NIIF", category: "Técnica", level: 3, yearsUsed: 2 },
        { name: "SAP FI", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "SUNAT – PDT", category: "Software", level: 5, yearsUsed: 3 },
        { name: "Excel avanzado", category: "Software", level: 4, yearsUsed: 4 },
      ],
      experience: [
        {
          company: "Estudio Contable Torres & Asociados",
          position: "Contadora Junior",
          description: "Declaraciones de renta, auditoría externa a 15 empresas pymes de Arequipa",
          startDate: new Date("2021-05-01"),
          endDate: null,
          isCurrent: true,
          salary: 2800,
        },
      ],
      languages: [{ language: "Español", level: "Nativo", certified: false }],
    },

    // 10. Psicología
    {
      email: "valeria.ramos@unsa.edu.pe",
      firstName: "Valeria",
      lastName: "Ramos Torres",
      career: "Psicología",
      faculty: "Psicología, Relaciones Industriales y Ciencias de la Comunicación",
      graduationStatus: "TITLED",
      graduationYear: 2023,
      admissionYear: 2018,
      gpa: 16.0,
      salaryExpectation: 2800,
      salaryExpectationMax: 4500,
      headline: "Psicóloga | RRHH · Salud Mental · Bienestar Organizacional",
      summary: "Psicóloga colegiada con experiencia en selección de personal, evaluación psicológica y programas de bienestar en empresas.",
      availability: "IMMEDIATE",
      workModality: "Híbrido",
      phone: "967890123",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Evaluación psicológica", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Selección de personal", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Bienestar organizacional", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Terapia cognitivo-conductual", category: "Técnica", level: 3, yearsUsed: 1.5 },
        { name: "Empatía", category: "Blanda", level: 5, yearsUsed: 4 },
      ],
      experience: [
        {
          company: "Clínica San Pablo – Arequipa",
          position: "Psicóloga Asistencial",
          description: "Atención clínica individual, evaluación y talleres de salud mental",
          startDate: new Date("2023-06-01"),
          endDate: null,
          isCurrent: true,
          salary: 2500,
        },
      ],
      languages: [{ language: "Español", level: "Nativo", certified: false }],
    },

    // 11. Arquitectura – Con alerta de verificación para demo admin
    {
      email: "javier.salas@unsa.edu.pe",
      firstName: "Javier",
      lastName: "Salas Cruz",
      career: "Arquitectura",
      faculty: "Arquitectura y Urbanismo",
      graduationStatus: "GRADUATED",
      graduationYear: 2024,
      admissionYear: 2019,
      gpa: 13.5,
      salaryExpectation: 4200,
      salaryExpectationMax: 6000,
      headline: "Arquitecto | Diseño Urbano · Revit · BIM · Vivienda Social",
      summary: "Arquitecto egresado con experiencia en diseño habitacional y proyectos de vivienda social para el Ministerio de Vivienda.",
      availability: "IN_30_DAYS",
      workModality: "Presencial",
      phone: "989012345",
      verificationStatus: "IN_REVIEW",
      skills: [
        { name: "AutoCAD", category: "Software", level: 5, yearsUsed: 4 },
        { name: "Revit", category: "Software", level: 4, yearsUsed: 2 },
        { name: "SketchUp", category: "Software", level: 4, yearsUsed: 3 },
        { name: "BIM", category: "Técnica", level: 3, yearsUsed: 1.5 },
        { name: "Diseño bioclimático", category: "Técnica", level: 3, yearsUsed: 1 },
      ],
      experience: [
        {
          company: "Estudio de Arquitectura Medina & Ríos",
          position: "Arquitecto Junior",
          description: "Diseño de viviendas unifamiliares y multifamiliares, trámites en municipalidad",
          startDate: new Date("2024-02-01"),
          endDate: null,
          isCurrent: true,
          salary: 3000,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Básico", certified: false },
      ],
    },

    // 13. Administración de Empresas – Marketing digital
    {
      email: "andrea.delgado@unsa.edu.pe",
      firstName: "Andrea",
      lastName: "Delgado Paredes",
      career: "Administración de Empresas",
      faculty: "Administración",
      graduationStatus: "TITLED",
      graduationYear: 2023,
      admissionYear: 2018,
      gpa: 15.4,
      salaryExpectation: 3000,
      salaryExpectationMax: 5000,
      headline: "Administradora | Marketing Digital · E-commerce · CRM · Google Ads",
      summary: "Administradora de empresas con especialización en marketing digital y gestión de campañas para pymes. Experiencia en Meta Ads y Google Ads con más de S/ 50k gestionados.",
      availability: "IMMEDIATE",
      workModality: "Híbrido",
      phone: "912456789",
      linkedinUrl: "https://linkedin.com/in/andrea-delgado-mkt",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Marketing digital", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "Google Ads", category: "Software", level: 4, yearsUsed: 2 },
        { name: "Meta Ads", category: "Software", level: 4, yearsUsed: 2 },
        { name: "CRM HubSpot", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "E-commerce", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Análisis de métricas", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Power BI", category: "Software", level: 3, yearsUsed: 1 },
        { name: "Liderazgo", category: "Blanda", level: 4, yearsUsed: 3 },
      ],
      experience: [
        {
          company: "Agencia Digital Impulso360 – Arequipa",
          position: "Coordinadora de Campañas",
          description: "Gestión de campañas SEM/SEO y redes sociales para 12 clientes del sector retail y turismo",
          startDate: new Date("2023-03-01"),
          endDate: null,
          isCurrent: true,
          salary: 3200,
        },
        {
          company: "Tiendas EFE – Arequipa",
          position: "Asistente de Marketing (Practicante)",
          description: "Apoyo en campañas de temporada, análisis de ventas y coordinación con agencias externas",
          startDate: new Date("2022-06-01"),
          endDate: new Date("2022-12-31"),
          isCurrent: false,
          salary: 1200,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Intermedio", certified: true },
        { language: "Portugués", level: "Básico", certified: false },
      ],
    },

    // 14. Ingeniería Industrial – Logística y operaciones
    {
      email: "sebastian.rios@unsa.edu.pe",
      firstName: "Sebastián",
      lastName: "Ríos Velásquez",
      career: "Ingeniería Industrial",
      faculty: "Ingeniería de Producción y Servicios",
      graduationStatus: "GRADUATED",
      graduationYear: 2023,
      admissionYear: 2018,
      gpa: 14.1,
      salaryExpectation: 4000,
      salaryExpectationMax: 6500,
      headline: "Ing. Industrial | Lean Manufacturing · Six Sigma · Logística · SAP MM",
      summary: "Egresado de Ingeniería Industrial con experiencia en optimización de procesos y cadena de suministro. Certificación Lean Six Sigma Yellow Belt.",
      availability: "IN_30_DAYS",
      workModality: "Presencial",
      phone: "934789012",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Lean Manufacturing", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Six Sigma", category: "Técnica", level: 3, yearsUsed: 1.5 },
        { name: "SAP MM", category: "Software", level: 3, yearsUsed: 1 },
        { name: "Gestión de almacenes", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Excel avanzado", category: "Software", level: 5, yearsUsed: 4 },
        { name: "AutoCAD de plantas", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "Gestión de calidad ISO 9001", category: "Técnica", level: 3, yearsUsed: 1 },
        { name: "Negociación", category: "Blanda", level: 4, yearsUsed: 2 },
      ],
      experience: [
        {
          company: "Alicorp S.A.A. – Planta Arequipa",
          position: "Asistente de Planeamiento y Control de Producción",
          description: "Planificación de producción semanal, control de inventarios de materias primas y seguimiento de KPIs de planta",
          startDate: new Date("2023-06-01"),
          endDate: null,
          isCurrent: true,
          salary: 3800,
        },
        {
          company: "Yura S.A. – Planta de Cemento",
          position: "Practicante de Ingeniería Industrial",
          description: "Estudio de tiempos y movimientos en línea de ensacado, propuesta de mejora que redujo 12% el tiempo de ciclo",
          startDate: new Date("2022-07-01"),
          endDate: new Date("2023-01-31"),
          isCurrent: false,
          salary: 1500,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Intermedio", certified: false },
      ],
    },

    // 15. Enfermería – Sector salud
    {
      email: "karina.mendoza@unsa.edu.pe",
      firstName: "Karina",
      lastName: "Mendoza Cáceres",
      career: "Enfermería",
      faculty: "Ciencias Médicas",
      graduationStatus: "TITLED",
      graduationYear: 2022,
      admissionYear: 2017,
      gpa: 15.7,
      salaryExpectation: 3500,
      salaryExpectationMax: 5500,
      headline: "Enfermera titulada | UCI · Emergencias · Cuidados Intensivos · ESSALUD",
      summary: "Enfermera colegiada con 2 años de experiencia en Unidad de Cuidados Intensivos. Especialización en soporte vital avanzado (ACLS). Disponible para hospitales públicos y privados.",
      availability: "IMMEDIATE",
      workModality: "Presencial",
      phone: "956123890",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Cuidados intensivos (UCI)", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Soporte vital avanzado (ACLS)", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Administración de medicamentos IV", category: "Técnica", level: 5, yearsUsed: 3 },
        { name: "Triaje de emergencias", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Registro en HIS MINSA", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "Trabajo bajo presión", category: "Blanda", level: 5, yearsUsed: 3 },
        { name: "Empatía y comunicación con paciente", category: "Blanda", level: 5, yearsUsed: 4 },
      ],
      experience: [
        {
          company: "Hospital Regional Honorio Delgado – Arequipa",
          position: "Enfermera Asistencial – UCI",
          description: "Cuidado de pacientes críticos en UCI adultos, monitoreo hemodinámico, coordinación con equipo médico",
          startDate: new Date("2022-09-01"),
          endDate: null,
          isCurrent: true,
          salary: 3200,
        },
        {
          company: "EsSalud – Hospital Edmundo Escomel",
          position: "Enfermera (SERUMS)",
          description: "SERUMS en área de emergencias y consulta externa, atención comunitaria en zonas periurbanas",
          startDate: new Date("2022-01-01"),
          endDate: new Date("2022-08-31"),
          isCurrent: false,
          salary: 2800,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Básico", certified: false },
        { language: "Quechua", level: "Básico", certified: false },
      ],
    },

    // 12. Ing. Electrónica – Perfil telecomunicaciones
    {
      email: "fernando.cruz@unsa.edu.pe",
      firstName: "Fernando",
      lastName: "Cruz Puma",
      career: "Ingeniería Electrónica",
      faculty: "Ingeniería Eléctrica y Electrónica",
      graduationStatus: "TITLED",
      graduationYear: 2022,
      admissionYear: 2017,
      gpa: 14.7,
      salaryExpectation: 4500,
      salaryExpectationMax: 7000,
      headline: "Ing. Electrónico | Telecomunicaciones · IoT · Redes · Microcontroladores",
      summary: "Ingeniero electrónico titulado con especialización en redes de telecomunicaciones y sistemas embebidos.",
      availability: "IMMEDIATE",
      workModality: "Presencial",
      phone: "923456789",
      verificationStatus: "VERIFIED",
      skills: [
        { name: "Redes TCP/IP", category: "Técnica", level: 4, yearsUsed: 3 },
        { name: "Arduino / ESP32", category: "Software", level: 5, yearsUsed: 4 },
        { name: "MATLAB", category: "Software", level: 3, yearsUsed: 2 },
        { name: "Cisco IOS", category: "Software", level: 3, yearsUsed: 1.5 },
        { name: "IoT", category: "Técnica", level: 4, yearsUsed: 2 },
        { name: "Fibra óptica", category: "Técnica", level: 3, yearsUsed: 1 },
      ],
      experience: [
        {
          company: "Claro Perú – Arequipa",
          position: "Técnico de Redes",
          description: "Instalación y mantenimiento de redes HFC, configuración de equipos CMTS",
          startDate: new Date("2022-08-01"),
          endDate: new Date("2024-05-31"),
          isCurrent: false,
          salary: 3500,
        },
      ],
      languages: [
        { language: "Español", level: "Nativo", certified: false },
        { language: "Inglés", level: "Intermedio", certified: false },
      ],
    },
  ];

  for (const s of students) {
    const { email, firstName, lastName, career, faculty, graduationStatus, graduationYear,
      admissionYear, gpa, salaryExpectation, salaryExpectationMax, headline, summary,
      availability, workModality, phone, linkedinUrl, verificationStatus,
      skills, experience, languages } = s;

    await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: studentPassword,
        role: "STUDENT",
        student: {
          create: {
            firstName,
            lastName,
            career,
            faculty,
            graduationStatus: graduationStatus as "ACTIVE" | "GRADUATED" | "TITLED",
            graduationYear,
            admissionYear,
            gpa,
            salaryExpectation,
            salaryExpectationMax,
            headline,
            summary,
            availability: availability as "IMMEDIATE" | "IN_30_DAYS" | "IN_60_DAYS" | "IN_90_DAYS" | "INTERNSHIP_ONLY" | "PART_TIME_ONLY",
            workModality,
            phone,
            linkedinUrl: linkedinUrl ?? null,
            verificationStatus: verificationStatus as "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "FLAGGED",
            profileScore: 75 + Math.floor(Math.random() * 20),
            skills: {
              create: skills.map((sk) => ({
                name: sk.name,
                category: sk.category,
                level: sk.level,
                yearsUsed: sk.yearsUsed,
              })),
            },
            experience: {
              create: experience.map((ex) => ({
                company: ex.company,
                position: ex.position,
                description: ex.description,
                startDate: ex.startDate,
                endDate: ex.endDate,
                isCurrent: ex.isCurrent,
                salary: ex.salary,
              })),
            },
            languages: {
              create: languages.map((l) => ({
                language: l.language,
                level: l.level,
                certified: l.certified,
              })),
            },
          },
        },
      },
    });
    console.log(`  ✅ ${firstName} ${lastName} (${career})`);
  }

  // ─── Formación Complementaria y Posgrado ─────────────────────────────────────
  const extraData: {
    email: string;
    certifications: { name: string; issuer: string; issueDate: Date | null; credentialUrl: string | null }[];
    education: { degree: string; field: string; institution: string; startYear: number; endYear: number | null; isCurrent: boolean }[];
  }[] = [
    {
      email: "maria.garcia@unsa.edu.pe",
      certifications: [
        { name: "Curso en React Avanzado y Next.js", issuer: "Platzi", issueDate: new Date("2023-06-15"), credentialUrl: null },
        { name: "Diplomado en Cloud Computing con AWS", issuer: "AWS Training & Certification", issueDate: new Date("2024-02-10"), credentialUrl: "https://aws.amazon.com/verification" },
        { name: "Programa de Especialización en Ciberseguridad", issuer: "ISIL", issueDate: new Date("2024-08-01"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "carlos.mamani@unsa.edu.pe",
      certifications: [
        { name: "Curso en Seguridad Minera – DS 024", issuer: "IPEMIN", issueDate: new Date("2022-03-01"), credentialUrl: null },
        { name: "Seminario en Gestión Ambiental para Operaciones Mineras", issuer: "OEFA", issueDate: new Date("2023-05-20"), credentialUrl: null },
        { name: "Diplomado en Geomecánica y Diseño de Taludes", issuer: "Pontificia Universidad Católica del Perú (PUCP)", issueDate: new Date("2024-01-15"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Ingeniería de Minas", institution: "Universidad Nacional de San Agustín (UNSA)", startYear: 2024, endYear: null, isCurrent: true },
      ],
    },
    {
      email: "ana.flores@unsa.edu.pe",
      certifications: [
        { name: "Curso en Soporte Vital Básico y Avanzado (RCP)", issuer: "American Heart Association (AHA)", issueDate: new Date("2023-02-28"), credentialUrl: null },
        { name: "Diplomado en Salud Pública y Epidemiología", issuer: "Universidad Peruana Cayetano Heredia (UPCH)", issueDate: new Date("2023-09-30"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Salud Pública", institution: "Universidad Peruana Cayetano Heredia (UPCH)", startYear: 2024, endYear: null, isCurrent: true },
      ],
    },
    {
      email: "luis.quispe@unsa.edu.pe",
      certifications: [
        { name: "Curso en BIM con Revit para Estructuras", issuer: "Autodesk Authorized Training Center", issueDate: new Date("2023-04-10"), credentialUrl: null },
        { name: "Programa de Especialización en Gestión de Proyectos de Infraestructura", issuer: "Project Management Institute (PMI) – Capítulo Perú", issueDate: new Date("2024-03-01"), credentialUrl: null },
        { name: "Seminario en Normas Sísmicas E.030 y Diseño Sismorresistente", issuer: "Colegio de Ingenieros del Perú – CD Arequipa", issueDate: new Date("2023-11-15"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "sofia.condori@unsa.edu.pe",
      certifications: [
        { name: "Curso en Data Science con Python", issuer: "Coursera – Universidad de Michigan", issueDate: new Date("2022-12-01"), credentialUrl: "https://coursera.org/verify/example" },
        { name: "Diplomado en Finanzas Cuantitativas y Gestión de Riesgos", issuer: "Universidad del Pacífico", issueDate: new Date("2023-07-31"), credentialUrl: null },
        { name: "Curso en Machine Learning para Economistas", issuer: "edX – MIT", issueDate: new Date("2024-01-20"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Economía con mención en Políticas Públicas", institution: "Pontificia Universidad Católica del Perú (PUCP)", startYear: 2023, endYear: null, isCurrent: true },
      ],
    },
    {
      email: "pedro.huanca@unsa.edu.pe",
      certifications: [
        { name: "Diplomado en Derecho Administrativo y Contrataciones del Estado", issuer: "Academia de la Magistratura (AMAG)", issueDate: new Date("2022-10-15"), credentialUrl: null },
        { name: "Seminario en Arbitraje en Contrataciones del Estado", issuer: "OSCE", issueDate: new Date("2023-06-30"), credentialUrl: null },
        { name: "Curso en Gestión Pública y Anticorrupción", issuer: "Contraloría General de la República", issueDate: new Date("2024-02-28"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Derecho Administrativo y Gestión Pública", institution: "Universidad Nacional de San Agustín (UNSA)", startYear: 2022, endYear: 2024, isCurrent: false },
      ],
    },
    {
      email: "rosa.apaza@unsa.edu.pe",
      certifications: [
        { name: "Curso en SIG / ArcGIS Pro para Evaluación Ambiental", issuer: "ESRI Perú", issueDate: new Date("2023-08-20"), credentialUrl: null },
        { name: "Diplomado en Gestión Ambiental y Evaluación de Impacto Ambiental", issuer: "Ministerio del Ambiente (MINAM)", issueDate: new Date("2024-03-15"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "diego.ccopa@unsa.edu.pe",
      certifications: [
        { name: "Curso en Deep Learning y Redes Neuronales", issuer: "DeepLearning.AI – Coursera", issueDate: new Date("2023-05-01"), credentialUrl: "https://coursera.org/verify/example2" },
        { name: "Programa de Especialización en Machine Learning Engineering", issuer: "Coursera – Google", issueDate: new Date("2024-04-01"), credentialUrl: null },
        { name: "Seminario en Computación Cuántica Aplicada", issuer: "IBM Quantum", issueDate: new Date("2024-09-10"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "lucia.pinto@unsa.edu.pe",
      certifications: [
        { name: "Diplomado en Normas Internacionales de Información Financiera (NIIF)", issuer: "Colegio de Contadores Públicos de Arequipa", issueDate: new Date("2022-09-30"), credentialUrl: null },
        { name: "Curso en Auditoría Interna basada en Riesgos", issuer: "Instituto de Auditores Internos del Perú (IIA Perú)", issueDate: new Date("2023-06-15"), credentialUrl: null },
        { name: "Programa de Especialización en Tributación Empresarial", issuer: "SUNAT – Escuela de la Administración Tributaria", issueDate: new Date("2024-02-01"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Tributación y Política Fiscal", institution: "Universidad Nacional de San Agustín (UNSA)", startYear: 2022, endYear: 2024, isCurrent: false },
      ],
    },
    {
      email: "valeria.ramos@unsa.edu.pe",
      certifications: [
        { name: "Curso en Terapia Cognitivo-Conductual (TCC) Aplicada", issuer: "Centro de Estudios Avanzados en Lima (CEAL)", issueDate: new Date("2023-04-30"), credentialUrl: null },
        { name: "Diplomado en Gestión de Recursos Humanos y Bienestar Organizacional", issuer: "ESAN Graduate School of Business", issueDate: new Date("2024-01-31"), credentialUrl: null },
      ],
      education: [
        { degree: "Segunda Especialidad", field: "Neuropsicología Clínica", institution: "Universidad Nacional Mayor de San Marcos (UNMSM)", startYear: 2024, endYear: null, isCurrent: true },
      ],
    },
    {
      email: "javier.salas@unsa.edu.pe",
      certifications: [
        { name: "Curso en BIM con Revit para Arquitectura", issuer: "Autodesk Authorized Training Center", issueDate: new Date("2023-07-15"), credentialUrl: null },
        { name: "Seminario en Urbanismo Sostenible y Ciudades Resilientes", issuer: "Colegio de Arquitectos del Perú – Regional Arequipa", issueDate: new Date("2024-03-20"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "andrea.delgado@unsa.edu.pe",
      certifications: [
        { name: "Curso en Google Ads y Campañas de Búsqueda", issuer: "Google – Skillshop", issueDate: new Date("2022-11-30"), credentialUrl: "https://skillshop.credential.net/example" },
        { name: "Programa de Especialización en Marketing Digital y E-commerce", issuer: "ISIL", issueDate: new Date("2023-08-31"), credentialUrl: null },
        { name: "Diplomado en Dirección de Marketing Estratégico", issuer: "ESAN Graduate School of Business", issueDate: new Date("2024-04-30"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "sebastian.rios@unsa.edu.pe",
      certifications: [
        { name: "Curso en Lean Six Sigma Yellow Belt", issuer: "American Society for Quality (ASQ)", issueDate: new Date("2023-03-15"), credentialUrl: null },
        { name: "Diplomado en Logística y Supply Chain Management", issuer: "ESAN Graduate School of Business", issueDate: new Date("2023-11-30"), credentialUrl: null },
        { name: "Seminario en Industria 4.0 y Automatización de Procesos", issuer: "Siemens Perú", issueDate: new Date("2024-05-10"), credentialUrl: null },
      ],
      education: [],
    },
    {
      email: "karina.mendoza@unsa.edu.pe",
      certifications: [
        { name: "Curso en Soporte Vital Cardiovascular Avanzado (ACLS)", issuer: "American Heart Association (AHA)", issueDate: new Date("2022-10-01"), credentialUrl: null },
        { name: "Diplomado en Cuidados Críticos y Medicina Intensiva", issuer: "EsSalud – Instituto de Evaluación de Tecnologías en Salud e Investigación", issueDate: new Date("2023-08-31"), credentialUrl: null },
      ],
      education: [
        { degree: "Segunda Especialidad", field: "Enfermería en Cuidados Intensivos", institution: "Universidad Nacional Mayor de San Marcos (UNMSM)", startYear: 2023, endYear: null, isCurrent: true },
      ],
    },
    {
      email: "fernando.cruz@unsa.edu.pe",
      certifications: [
        { name: "Curso en Cisco CCNA – Redes y Switching", issuer: "Cisco Networking Academy", issueDate: new Date("2022-07-20"), credentialUrl: null },
        { name: "Diplomado en Internet de las Cosas (IoT) y Automatización Industrial", issuer: "Universidad Tecnológica del Perú (UTP)", issueDate: new Date("2023-09-15"), credentialUrl: null },
        { name: "Programa de Especialización en 5G y Telecomunicaciones Avanzadas", issuer: "Ericsson Academy", issueDate: new Date("2024-06-01"), credentialUrl: null },
      ],
      education: [
        { degree: "Maestría", field: "Ingeniería en Telecomunicaciones", institution: "Pontificia Universidad Católica del Perú (PUCP)", startYear: 2024, endYear: null, isCurrent: true },
      ],
    },
  ];

  console.log("\n📚 Agregando formación complementaria y posgrado...");
  for (const extra of extraData) {
    const user = await db.user.findUnique({ where: { email: extra.email }, include: { student: true } });
    if (!user?.student) continue;
    const sid = user.student.id;

    await db.certification.deleteMany({ where: { studentId: sid } });
    if (extra.certifications.length > 0) {
      await db.certification.createMany({
        data: extra.certifications.map((c) => ({ studentId: sid, ...c })),
      });
    }

    await db.education.deleteMany({ where: { studentId: sid } });
    if (extra.education.length > 0) {
      await db.education.createMany({
        data: extra.education.map((e) => ({ studentId: sid, ...e })),
      });
    }
    console.log(`  📖 ${extra.email} — ${extra.certifications.length} cert(s), ${extra.education.length} posgrado(s)`);
  }

  console.log("\n🎉 Seed completado:");
  console.log("   Admin:       admin@udeeg.unsa.edu.pe / admin1234");
  console.log("   Empresa 1:   rrhh@mineroandino.pe / empresa1234");
  console.log("   Empresa 2:   talento@tecnosur.com.pe / empresa1234");
  console.log("   Estudiantes: *.@unsa.edu.pe / estudiante1234");
  console.log("\n🖥️  Demo SERVIR: http://localhost:3000/demo");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
