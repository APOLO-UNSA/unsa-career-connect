# UNSA Career Connect
### Bolsa de Trabajo Inteligente · Universidad Nacional de San Agustín de Arequipa

> Plataforma web full-stack que conecta estudiantes y egresados de la UNSA con empresas y convocatorias del Estado, mediante perfiles verificados, matching con IA (LLM) y alertas personalizadas de SERVIR.

---

## Índice

1. [Contexto y Problemática](#1-contexto-y-problemática)
2. [Solución Propuesta](#2-solución-propuesta)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Estructura de Carpetas](#5-estructura-de-carpetas)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Motor de Matching con IA (Groq)](#7-motor-de-matching-con-ia-groq)
8. [Sistema de Verificación](#8-sistema-de-verificación)
9. [Integración SERVIR](#9-integración-servir)
10. [API Reference](#10-api-reference)
11. [Instalación Local](#11-instalación-local)
12. [Despliegue en AWS EC2](#12-despliegue-en-aws-ec2)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Flujos de Usuario](#14-flujos-de-usuario)

---

## 1. Contexto y Problemática

La **UDEEG** (Unidad de Desarrollo Estudiantil del Egresado y Graduado) de la UNSA actúa como puente entre la comunidad académica y el mercado laboral. Los puntos de dolor identificados:

| Problema | Impacto |
|---|---|
| 736 correos manuales en 6 meses | Saturación y pérdida de oportunidades |
| Textos planos sin estructura | Imposible filtrar por sueldo, habilidades, ubicación |
| Sin base de datos estandarizada | No hay métricas de egresados ni seguimiento |
| Ofertas caducan en días | Difusión tardía o nula |
| Perfiles no verificados | Empresas reciben candidatos con datos inflados |

---

## 2. Solución Propuesta

**UNSA Career Connect** es una plataforma en tres capas:

```
EMPRESAS ──────────────────────────────────────────────────────────────────────
   │  Chat LLM → describe puesto en lenguaje natural
   │  Sistema extrae: carrera, skills, experiencia, rango salarial
   │  Consulta DB → rankea candidatos verificados con score IA
   └─ Recibe lista ordenada + explicación del match + info de contacto

ESTUDIANTES / EGRESADOS ────────────────────────────────────────────────────────
   │  CV estandarizado: datos académicos, habilidades, exp. salarial
   │  IA detecta anomalías → alertas → revisión UDEEG
   │  Verificación presencial si es necesario → sello "Verificado"
   └─ Alertas personalizadas de SERVIR (empleo público)

ADMINISTRADORES UDEEG ──────────────────────────────────────────────────────────
   │  Panel de verificación con alertas por severidad
   │  Herramientas: aprobar / rechazar / citar a reunión presencial
   └─ Despacho masivo de alertas SERVIR
```

---

## 3. Arquitectura del Sistema

```
                    ┌─────────────────────────────────────┐
                    │          Usuario Final               │
                    │  (Estudiante / Empresa / Admin)     │
                    └────────────────┬────────────────────┘
                                     │ HTTPS
                    ┌────────────────▼────────────────────┐
                    │         Nginx (Reverse Proxy)        │
                    │  Rate Limiting · SSL/TLS · Headers  │
                    └────────────────┬────────────────────┘
                                     │
                    ┌────────────────▼────────────────────┐
                    │         Next.js 14 App               │
                    │  ┌──────────┐  ┌──────────────────┐ │
                    │  │ App      │  │ API Routes       │ │
                    │  │ Router   │  │ /api/students    │ │
                    │  │ (RSC)    │  │ /api/matching    │ │
                    │  │          │  │ /api/verificacion│ │
                    │  │          │  │ /api/servir      │ │
                    │  └──────────┘  └────────┬─────────┘ │
                    └───────────────────────┬─┼───────────┘
                                            │ │
              ┌─────────────────────────────┘ │
              │                               │
┌─────────────▼──────────┐    ┌──────────────▼──────────────────┐
│   PostgreSQL (Prisma)   │    │    Groq API (Llama 3.1)         │
│                         │    │                                  │
│  users                  │    │  • llama-3.1-70b-versatile      │
│  students               │    │    → Extracción de requisitos    │
│  companies              │    │    → Ranking de candidatos       │
│  matching_searches      │    │  • llama-3.1-8b-instant         │
│  match_results          │    │    → Chat conversacional         │
│  verification_alerts    │    │    → Resumen del puesto          │
│  job_alerts             │    │                                  │
└─────────────────────────┘    └──────────────────────────────────┘
                                         ↑ ~$0.05/M tokens (gratis en dev)

                    ┌────────────────────────────────────┐
                    │       SMTP (Nodemailer)            │
                    │  Alertas SERVIR por email          │
                    │  HTML responsivo con jobs filtrados│
                    └────────────────────────────────────┘
```

### Diagrama de componentes en AWS

```
Internet
    │
    ▼
Route 53 (DNS) ──→ tu-dominio.com
    │
    ▼
AWS EC2 (t3.small recomendado)
├── Nginx (puerto 80/443) ──→ Certbot (Let's Encrypt SSL gratis)
├── Next.js App (puerto 3000, Docker)
├── PostgreSQL (puerto 5432, Docker, solo interno)
└── Certbot (renovación auto SSL, cron diario)
```

---

## 4. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR, SEO, routing integrado |
| **Estilos** | Tailwind CSS + Radix UI | Rápido, accesible, sin CSS custom |
| **Backend** | Next.js API Routes | Full-stack en un solo repo |
| **ORM** | Prisma + PostgreSQL | Type-safe, migraciones automáticas |
| **Auth** | NextAuth.js v4 | JWT, multi-rol (student/company/admin) |
| **LLM** | **Groq + Llama 3.1** | **La opción más económica:** free tier generoso, $0.05/M tokens, latencia <1s |
| **Email** | Nodemailer | Alertas SERVIR personalizadas |
| **Contenedor** | Docker + Docker Compose | Portabilidad EC2 |
| **Proxy** | Nginx | SSL, rate limiting, compresión |
| **SSL** | Let's Encrypt (Certbot) | Gratuito, renovación automática |

### ¿Por qué Groq con Llama 3.1?

```
Comparativa de costos LLM para este caso de uso (1000 búsquedas/mes estimadas):

Provider              Modelo                  Costo/mes estimado
─────────────────────────────────────────────────────────────
Groq (Llama 3.1 70B)  llama-3.1-70b-versatile  ~$2–5 USD  ✅ ELEGIDO
Groq (Llama 3.1 8B)   llama-3.1-8b-instant     ~$0.5 USD  (chat)
OpenAI                GPT-4o                   ~$30–60 USD
OpenAI                GPT-4o-mini              ~$3–8 USD
Anthropic             Claude Haiku             ~$5–12 USD
Google                Gemini Flash             ~$1–3 USD

Ventaja adicional de Groq: velocidad de ~500 tokens/seg (muy rápido para UX)
```

---

## 5. Estructura de Carpetas

```
unsa-career-connect/
├── README.md                    ← Este archivo
├── Dockerfile                   ← Imagen Docker de producción
├── docker-compose.yml           ← Orquestación de servicios
├── .env.example                 ← Template de variables de entorno
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma            ← Modelo de datos completo
│   └── seed.ts                  ← Datos de demo (12 estudiantes, 2 empresas, admin)
│
├── src/
│   ├── lib/
│   │   ├── db.ts                ← Cliente Prisma (singleton)
│   │   ├── auth.ts              ← Config NextAuth, roles
│   │   ├── groq.ts              ← Motor de matching IA (CORE)
│   │   ├── verification.ts      ← Detección de anomalías
│   │   ├── servir.ts            ← 45 convocatorias simuladas + filtrado + email
│   │   └── types.ts             ← Tipos TypeScript + benchmarks salariales
│   │
│   ├── app/
│   │   ├── layout.tsx           ← Root layout
│   │   ├── page.tsx             ← Landing page (con link a demo)
│   │   ├── providers.tsx        ← SessionProvider
│   │   ├── globals.css          ← Estilos globales + colores UNSA
│   │   │
│   │   ├── demo/
│   │   │   └── page.tsx         ← Demo interactiva SERVIR (SIN auth) ⭐
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── students/
│   │   │   │   ├── route.ts     ← GET lista, POST registro
│   │   │   │   └── [id]/route.ts ← GET perfil, PATCH actualizar
│   │   │   ├── matching/route.ts ← POST búsqueda IA, PUT chat
│   │   │   ├── verification/route.ts ← GET alertas, POST resolver
│   │   │   └── servir/
│   │   │       ├── route.ts     ← GET jobs autenticado, POST despachar alertas
│   │   │       └── demo/route.ts ← GET público sin auth (para demo) ⭐
│   │   │
│   │   ├── (auth)/              ← Rutas de autenticación
│   │   ├── (estudiante)/        ← Portal del estudiante
│   │   │   ├── dashboard/
│   │   │   ├── perfil/
│   │   │   └── oportunidades/   ← Alertas SERVIR filtradas
│   │   ├── (empresa)/           ← Portal de empresas
│   │   │   ├── dashboard/
│   │   │   └── buscar/          ← Chat LLM de búsqueda (CORE)
│   │   └── (admin)/             ← Panel UDEEG
│   │       ├── dashboard/
│   │       └── verificacion/    ← Gestión de alertas
│
├── nginx/
│   └── nginx.conf               ← Config Nginx con SSL y rate limiting
│
└── scripts/
    └── deploy.sh                ← Script de despliegue en EC2
```

---

## 6. Modelo de Datos

### Entidades principales

```
User (1) ──────────────── (1) Student
         ├─────────────── (1) Company
         └─────────────── (1) Admin

Student (1) ─────────── (N) StudentSkill
           ├──────────── (N) WorkExperience
           ├──────────── (N) Education
           ├──────────── (N) LanguageSkill
           ├──────────── (N) Certification
           ├──────────── (N) VerificationAlert   ← Generadas por el sistema de anomalías
           ├──────────── (N) JobAlert            ← Convocatorias SERVIR
           └──────────── (N) MatchResult         ← Resultados de búsquedas empresariales

Company (1) ─────────── (N) MatchingSearch
           └──────────── (N) JobPosition

MatchingSearch (1) ──── (N) MatchResult
```

### Estados de verificación del perfil

```
PENDING ──→ IN_REVIEW ──→ VERIFIED ✅
                │
                ├──→ FLAGGED ⚠️ (datos inconsistentes, reunión presencial requerida)
                └──→ REJECTED ❌
```

---

## 7. Motor de Matching con IA (Groq)

El flujo completo está en `src/lib/groq.ts`:

### Paso 1 – Extracción de requisitos (`extractJobRequirements`)

```typescript
// Input: lenguaje natural de la empresa
"Busco ingeniero de sistemas con Python y ML, 2 años exp, sueldo 4000-7000, híbrido Arequipa"

// Output: JSON estructurado (modelo: llama-3.1-70b-versatile, temp: 0.1)
{
  careers: ["Ingeniería de Sistemas", "Ciencia de la Computación"],
  skills: ["Python", "Machine Learning", "scikit-learn"],
  experienceYears: 2,
  salaryMin: 4000,
  salaryMax: 7000,
  modality: "Híbrido",
  location: "Arequipa",
  workType: "Tiempo completo",
  additionalNotes: "experiencia en proyectos ML en producción"
}
```

### Paso 2 – Consulta a PostgreSQL (`queryMatchingStudents`)

```typescript
// Filtra estudiantes verificados por:
// - carrera ∈ requirements.careers
// - salaryExpectation ≤ salaryMax * 1.2  (margen 20%)
// - graduationYear compatible con años de experiencia requeridos
// Limit 50 candidatos pre-filtrados
```

### Paso 3 – Ranking por LLM (`rankCandidates`)

```typescript
// Criterios de evaluación (100 pts total):
// ┌─────────────────────────────────────────┬──────────┐
// │ Alineación carrera ↔ puesto             │  30 pts  │
// │ Habilidades técnicas coincidentes       │  25 pts  │
// │ Experiencia laboral relevante           │  20 pts  │
// │ Promedio académico (GPA/20)             │  10 pts  │
// │ Expectativa salarial en rango ofrecido  │  10 pts  │
// │ Completitud y calidad del perfil        │   5 pts  │
// └─────────────────────────────────────────┴──────────┘
//
// Output: lista ordenada con score + explicación en español
```

### Chat conversacional (`chatWithBolsa`)

```typescript
// Modelo: llama-3.1-8b-instant (más barato para chat)
// Sistema detecta automáticamente cuando la empresa ha dado
// suficiente info para iniciar la búsqueda y lo sugiere.
```

---

## 8. Sistema de Verificación

Ubicado en `src/lib/verification.ts`. Se ejecuta automáticamente al actualizar el perfil.

### Validaciones implementadas

#### GPA / Promedio académico
```
| Condición                  | Severidad |
|----------------------------|-----------|
| Fuera de rango [0, 20]     | CRÍTICA   |
| > 19.5 (excepcional)       | MEDIA     |
| < 7 (bajo el aprobatorio)  | ALTA      |
```

#### Expectativa salarial
```
Benchmarks de mercado por carrera (soles/mes):
  Ingeniería de Sistemas:  2,500 – 5,000 – 15,000 (min/mediana/max)
  Ingeniería de Minas:     3,000 – 6,000 – 18,000
  Administración:          1,500 – 3,000 – 8,000
  Medicina:                3,000 – 7,000 – 20,000
  … (25 carreras con benchmarks)

Alertas:
  < SUELDO_MÍNIMO (S/ 1,025)  → ALTA
  > MEDIANA × 1.4 (activos)   → MEDIA
  > MÁXIMO × 1.5              → ALTA
```

#### Timeline de experiencia
```
- Fecha fin < fecha inicio          → ALTA
- Suma total > 40 años              → CRÍTICA
- Experiencia antes de edad laboral → MEDIA
```

#### Habilidades
```
- Nivel fuera de [1-5]             → MEDIA
- Experto (5) con < 1 año de uso   → MEDIA
- > 50 habilidades declaradas      → BAJA
```

#### Consistencia de graduación
```
- Tiempo de estudio < mínimo esperado por carrera → ALTA
- Titulado sin año de graduación válido            → ALTA
```

### Flujo post-detección

```
Alerta detectada
       │
       ├── BAJA/MEDIA ──→ Perfil pasa a IN_REVIEW
       │                  Admin revisa en panel
       │
       └── ALTA/CRÍTICA → Perfil pasa a FLAGGED
                          Admin puede:
                          ├── VERIFY    → Perfil verificado
                          ├── REJECT    → Perfil rechazado
                          └── CITAR A REUNIÓN → Presencial en UDEEG
                                 ↓
                              Reunión realizada
                                 ↓
                              VERIFY o REJECT
```

---

## 9. Integración SERVIR (con Demo Simulada)

`src/lib/servir.ts` implementa la integración con el portal de empleo público del Perú.

### Dataset simulado para demo

El sistema incluye **45 convocatorias** basadas en publicaciones reales del Estado peruano, cubriendo las 52 carreras de la UNSA:

| Sector | Instituciones representadas | Carreras |
|---|---|---|
| TI / Digital | RENIEC, PCM, SUNAT, INEI | Sistemas, Computación, Electrónica, Telecomunicaciones |
| Minería | MINEM, INGEMMET, Activos Mineros | Minas, Geología, Geofísica, Metalurgia |
| Medio Ambiente | OEFA, MINAM, ANA | Ambiental, Biología, Química, Sanitaria |
| Economía / Finanzas | MEF, BCR, SBS, Contraloría | Economía, Finanzas, Contabilidad, Administración |
| Salud | MINSA, EsSalud, Qali Warma | Medicina, Enfermería, Nutrición, Psicología |
| Social / Jurídico | MIDIS, Defensoría, MTPE, OSCE | Trabajo Social, Derecho, Sociología, RRHH |
| Ciencias / Investigación | CONCYTEC, SENAMHI, IMARPE | Física, Matemáticas, Biología marina, Materiales |
| Cultura / Comunicación | Min. Cultura, INDECOPI, PromPerú | Historia, Turismo, Periodismo, Filosofía |
| Infraestructura | MTC, Vivienda, ANA | Ingeniería Civil, Sanitaria, Arquitectura |

### Demo pública en `/demo`

La página `/demo` es **accesible sin login**, ideal para presentación:

```
Flujo de la demo:
  1. Usuario selecciona carrera (ej. "Ingeniería de Sistemas")
  2. Animación de pipeline:
     > Consultando portal SERVIR...  ✓
     > Descargando convocatorias...  ✓
     > Analizando compatibilidad...  ✓
     > Filtrando por carrera...      ✓
     > Preparando alertas...         ✓
  3. Resultado: "X convocatorias coinciden (Y% del pool)"
  4. Vista de convocatorias con badge "Match" en cada una
  5. Preview del email HTML que recibiría el estudiante
  6. Pestaña de estadísticas: top carreras, ciudades, salario promedio
```

### API de demo pública

```
GET /api/servir/demo
→ Todas las convocatorias + estadísticas generales (sin auth)

GET /api/servir/demo?career=Ingeniería de Minas
→ {
    career: "Ingeniería de Minas",
    total: 3,
    totalPool: 45,
    matchRate: 7,
    jobs: [...]
  }
```

### Flujo de producción

```
1. Estudiante verifica su perfil en la UDEEG
2. Cron diario consulta talento.servir.gob.pe
3. Sistema filtra por carrera + habilidades de cada estudiante
4. Envía email HTML personalizado solo a quienes aplican
5. Admin puede despachar alertas masivas desde el panel

POST /api/servir → envía emails a TODOS los estudiantes verificados
GET  /api/servir?studentId=X → convocatorias para un estudiante específico
```

### Email de alerta (HTML responsivo)

```
┌─────────────────────────────────────────────┐
│  🎓 UNSA Career Connect  (header rojo UNSA) │
├─────────────────────────────────────────────┤
│  Hola, [Nombre] 👋                          │
│  Encontramos 3 oportunidades del Estado...  │
│                                             │
│  Puesto          | Sueldo | Lugar  | Cierre │
│  ─────────────────────────────────────────  │
│  Esp. Civil MTC  | S/5500 | Lima   | 15 jul │
│  Analista Sis.   | S/4000 | Arequipa| 10 jul│
│  Esp. Ambiental  | S/4500 | Lima   | 20 jul │
│                                             │
│  [Ver todas las convocatorias]              │
└─────────────────────────────────────────────┘
```

---

## 10. API Reference

### Autenticación

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/signin` | POST | Login (NextAuth) |
| `/api/auth/session` | GET | Sesión actual |

### Estudiantes

| Endpoint | Método | Roles | Descripción |
|---|---|---|---|
| `/api/students` | POST | Público | Registro de estudiante |
| `/api/students` | GET | Admin/Empresa | Lista estudiantes verificados |
| `/api/students/:id` | GET | Auth | Perfil del estudiante |
| `/api/students/:id` | PATCH | Propio/Admin | Actualizar perfil (activa verificación) |

### Matching IA

| Endpoint | Método | Roles | Descripción |
|---|---|---|---|
| `/api/matching` | POST | Empresa/Admin | Búsqueda de candidatos con IA |
| `/api/matching` | PUT | Empresa/Admin | Chat conversacional |

**Body POST `/api/matching`:**
```json
{
  "query": "Busco ingeniero civil con experiencia en estructuras, 3 años, S/4000-6000, presencial Arequipa",
  "companyId": "cuid_de_la_empresa"
}
```

**Response:**
```json
{
  "searchId": "abc123",
  "summary": "Se busca ingeniero civil con especialización en estructuras...",
  "totalFound": 5,
  "requirements": { "careers": ["Ingeniería Civil"], "salaryMin": 4000, ... },
  "candidates": [
    {
      "id": "...", "name": "...", "matchScore": 88.5,
      "matchRank": 1,
      "explanation": "Candidato ideal: carrera exacta, 4 años experiencia en estructuras metálicas, GPA 15.8/20, disponible de inmediato.",
      "contact": { "email": "...", "phone": "...", "linkedinUrl": "..." }
    }
  ]
}
```

### Verificación

| Endpoint | Método | Roles | Descripción |
|---|---|---|---|
| `/api/verification` | GET | Admin | Panel de alertas por resolver |
| `/api/verification` | POST | Admin | Resolver caso (aprobar/rechazar/citar) |

### SERVIR

| Endpoint | Método | Roles | Descripción |
|---|---|---|---|
| `/api/servir?studentId=X` | GET | Propio/Admin | Jobs SERVIR para estudiante |
| `/api/servir` | POST | Admin | Despachar alertas masivas por email |
| `/api/servir/demo` | GET | **Público** | Pool completo + stats (sin auth, para demo) |
| `/api/servir/demo?career=X` | GET | **Público** | Filtrado por carrera con match rate |

---

## 11. Instalación Local

### Prerequisitos
- Node.js 20+
- PostgreSQL 15+ (o Docker)
- Cuenta gratuita en [console.groq.com](https://console.groq.com) para obtener la API key

### Pasos

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd unsa-career-connect

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (mínimo: DATABASE_URL, NEXTAUTH_SECRET, GROQ_API_KEY)

# 4. Crear la base de datos con Docker (opcional)
docker run -d \
  --name unsa_db \
  -e POSTGRES_DB=unsa_career_connect \
  -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 \
  postgres:16-alpine

# 5. Inicializar la base de datos
npm run db:push        # Crear tablas
npm run db:generate    # Generar cliente Prisma

# 6. Cargar datos de demo (recomendado para presentación)
npm run db:seed
# Crea: 1 admin + 2 empresas + 12 estudiantes/egresados verificados

# 7. Iniciar en modo desarrollo
npm run dev

# Abrir http://localhost:3000
# Demo SERVIR (sin login): http://localhost:3000/demo
```

### Usuarios de demo (creados por el seed)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador UDEEG | admin@udeeg.unsa.edu.pe | admin1234 |
| Empresa – Minero Andino | rrhh@mineroandino.pe | empresa1234 |
| Empresa – TecnoSur | talento@tecnosur.com.pe | empresa1234 |
| Estudiante (Ing. Sistemas) | maria.garcia@unsa.edu.pe | estudiante1234 |
| Estudiante (Ing. Minas) | carlos.mamani@unsa.edu.pe | estudiante1234 |
| Estudiante (Medicina) | ana.flores@unsa.edu.pe | estudiante1234 |
| Estudiante (Economía) | sofia.condori@unsa.edu.pe | estudiante1234 |
| … 8 más | *.@unsa.edu.pe | estudiante1234 |

> La demo SERVIR en `/demo` **no requiere login** y muestra las 45 convocatorias simuladas con filtrado interactivo por carrera.

### Obtener GROQ_API_KEY (gratis)

1. Ir a [console.groq.com](https://console.groq.com)
2. Crear cuenta gratuita
3. API Keys → Create new key
4. Copiar al `.env` como `GROQ_API_KEY=gsk_...`

El free tier incluye:
- 14,400 requests/día con `llama-3.1-8b-instant`
- 1,000 requests/día con `llama-3.1-70b-versatile`
- Suficiente para desarrollo y demos

---

## 12. Despliegue en AWS EC2

### Instancia recomendada
- **EC2 t3.small** (2 vCPU, 2 GB RAM) — ~$15/mes
- AMI: Ubuntu 24.04 LTS
- Almacenamiento: 20 GB GP3
- Security Groups: puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Configurar DNS

En tu proveedor de dominio o Route 53:
```
Tipo A  →  tu-dominio.com       →  IP_PUBLICA_DE_EC2
Tipo A  →  www.tu-dominio.com   →  IP_PUBLICA_DE_EC2
```

Esperar propagación DNS (5-30 minutos).

### Despliegue automático

```bash
# Conectar a EC2
ssh -i tu-clave.pem ubuntu@IP_DE_EC2

# Subir el proyecto
scp -i tu-clave.pem -r ./unsa-career-connect ubuntu@IP_DE_EC2:/tmp/

# O clonar desde GitHub (recomendado)
git clone https://github.com/tu-usuario/unsa-career-connect.git /opt/unsa-career-connect

# Ejecutar script de despliegue
bash /opt/unsa-career-connect/scripts/deploy.sh tu-dominio.com
```

El script automatiza:
1. Instalación de Docker y Docker Compose
2. Configuración de `.env` con secrets aleatorios
3. Obtención de certificado SSL (Let's Encrypt, gratuito)
4. Build y arranque de todos los contenedores
5. Configuración de cron para renovación automática de SSL

### Actualizar en producción

```bash
cd /opt/unsa-career-connect
git pull origin main
docker-compose up -d --build
```

---

## 13. Variables de Entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | URL pública de la app (ej: `https://tu-dominio.com`) |
| `NEXTAUTH_SECRET` | ✅ | String aleatorio ≥32 chars (`openssl rand -base64 32`) |
| `GROQ_API_KEY` | ✅ | API key de Groq (free en console.groq.com) |
| `SMTP_HOST` | ⚠️ | Host SMTP para alertas (ej: `smtp.gmail.com`) |
| `SMTP_PORT` | ⚠️ | Puerto SMTP (587 para TLS) |
| `SMTP_USER` | ⚠️ | Email remitente |
| `SMTP_PASS` | ⚠️ | App password (Gmail) |
| `SMTP_FROM` | ⚠️ | Display name + email (ej: `UNSA Career <no-reply@unsa.edu.pe>`) |

---

## 14. Flujos de Usuario

### Estudiante: Registro y verificación

```
1. Registro → /api/students (POST)
   └─ Datos: email, contraseña, nombre, carrera, facultad, estado

2. Completar perfil → PATCH /api/students/:id
   └─ Agrega: GPA, experiencia, habilidades, expectativa salarial

3. Sistema ejecuta verificación automática
   ├─ Datos OK → Estado: IN_REVIEW
   ├─ Datos con alertas medias → Estado: IN_REVIEW + alertas en panel admin
   └─ Datos críticos → Estado: FLAGGED + citación a UDEEG

4. Admin aprueba → Estado: VERIFIED ✅
   └─ Perfil disponible para empresas

5. Estudiante recibe alertas SERVIR por email (personalizadas)
```

### Empresa: Búsqueda de candidatos

```
1. Registro → /api/companies (POST)
   └─ RUC verificado, datos de empresa, email de contacto

2. Acceder al chat → /empresa/buscar
   └─ Chat LLM conversacional para definir el puesto

3. Especificar rango salarial (OBLIGATORIO)
   └─ Sin esto, el sistema no activa la búsqueda

4. Sistema hace matching → POST /api/matching
   └─ Extrae requisitos → consulta DB → rankea con IA

5. Empresa recibe lista rankeada con:
   └─ Score IA, explicación, info de contacto, habilidades, GPA, disponibilidad
```

### Administrador UDEEG: Verificación de perfiles

```
1. Dashboard → /admin/verificacion
   └─ Lista de estudiantes con alertas pendientes por severidad

2. Revisar alertas
   ├─ BAJA/MEDIA → Aprobar directamente si son aceptables
   ├─ ALTA → Revisar documentos adicionales
   └─ CRÍTICA → Citar a reunión presencial en oficinas UDEEG

3. Acciones disponibles:
   ├─ VERIFICAR → Perfil activo y disponible para empresas
   ├─ RECHAZAR → Perfil inactivo (puede corregir y reenviar)
   └─ CITAR A REUNIÓN → Marca como FLAGGED, estudiante debe presentarse

4. Despachar alertas SERVIR → POST /api/servir
   └─ Envía emails a todos los estudiantes verificados
```

---

## Roadmap

### Versión 1.0 (Prototipo Hackathon)
- [x] Sistema de registro y autenticación multi-rol
- [x] Perfil estandarizado de estudiante/egresado
- [x] Verificación de anomalías con alertas automáticas
- [x] Motor de matching LLM (Groq + Llama 3.1)
- [x] Chat conversacional para empresas
- [x] Integración SERVIR con alertas por email
- [x] Panel de verificación para UDEEG
- [x] Docker + Nginx + despliegue EC2
- [x] **45 convocatorias SERVIR simuladas** cubriendo las 52 carreras UNSA
- [x] **Demo pública `/demo`** con pipeline animado, filtrado interactivo y preview de email
- [x] **Endpoint público** `GET /api/servir/demo` sin autenticación (para presentación)
- [x] **Seed de datos** con 12 perfiles de egresados + 2 empresas + admin UDEEG

### Versión 1.1
- [ ] Carga de CV en PDF y extracción automática (vision LLM)
- [ ] Foto de perfil en S3
- [ ] Notificaciones push (PWA)
- [ ] API pública de SERVIR (reemplazar datos de muestra)
- [ ] Analytics dashboard para UDEEG

### Versión 2.0
- [ ] App móvil (React Native / Expo)
- [ ] Integración con sistema académico UNSA (verifica GPA automáticamente)
- [ ] Firma digital de documentos
- [ ] Sistema de recomendaciones entre egresados
- [ ] Videoentrevistas integradas

---

## Licencia

Proyecto desarrollado para la **Hackathon UNSA 2026**.
Universidad Nacional de San Agustín de Arequipa · UDEEG.

---

*Stack: Next.js 14 · PostgreSQL · Groq/Llama 3.1 · Docker · AWS EC2 · Nginx · Let's Encrypt*
