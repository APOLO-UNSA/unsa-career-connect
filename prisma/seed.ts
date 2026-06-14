/**
 * Seed de datos para demo – UNSA Career Connect
 * Ejecutar: npm run db:seed
 *
 * Crea usuarios de demostración para presentación de la hackathon:
 *   - 1 administrador UDEEG
 *   - 2 empresas verificadas
 *   - 12 estudiantes/egresados con perfiles completos (carreras variadas)
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
