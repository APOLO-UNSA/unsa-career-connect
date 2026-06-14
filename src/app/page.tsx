import Link from "next/link";
import {
  BriefcaseIcon,
  UsersIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Nav ─── */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-unsa-red rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              UNSA <span className="text-unsa-red">Career Connect</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm bg-unsa-red text-white px-4 py-2 rounded-lg hover:bg-unsa-red-dark transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="gradient-unsa text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-8">
            <SparklesIcon className="w-4 h-4" />
            <span>Bolsa de Trabajo Verificada · UDEEG · UNSA</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Conectamos talento universitario<br />
            <span className="text-unsa-gold-light">con oportunidades reales</span>
          </h1>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            La plataforma oficial de la Universidad Nacional de San Agustín de Arequipa
            para estudiantes, egresados y empresas. Perfiles verificados, matching con IA y
            alertas personalizadas del Estado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro?tipo=estudiante"
              className="bg-white text-unsa-red font-semibold px-8 py-3.5 rounded-xl hover:bg-red-50 transition-colors text-base"
            >
              Soy Estudiante / Egresado
            </Link>
            <Link
              href="/registro?tipo=empresa"
              className="bg-white/10 backdrop-blur border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Soy Empresa
            </Link>
          </div>
          <div className="mt-5">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-sm text-red-200 hover:text-white transition-colors border border-white/20 px-5 py-2 rounded-full"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Ver demo interactiva de alertas SERVIR
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-gray-50 py-12 border-b">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 text-center">
          {[
            { value: "52+", label: "Carreras disponibles" },
            { value: "736", label: "Convocatorias procesadas" },
            { value: "IA", label: "Matching inteligente" },
            { value: "SERVIR", label: "Alertas del Estado" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-unsa-red mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Un ecosistema completo que verifica perfiles, hace match con IA y conecta
            con oportunidades del sector público y privado.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: AcademicCapIcon,
                title: "Perfil Estandarizado",
                desc: "CV estructurado con datos académicos, habilidades, experiencia y expectativas salariales verificables.",
                color: "bg-red-50 text-unsa-red",
              },
              {
                icon: ShieldCheckIcon,
                title: "Verificación Presencial",
                desc: "La UDEEG valida tu información con IA primero. Casos con inconsistencias se resuelven en reuniones presenciales.",
                color: "bg-amber-50 text-amber-700",
              },
              {
                icon: SparklesIcon,
                title: "Matching con IA (Groq)",
                desc: "Las empresas describen el puesto en lenguaje natural y el LLM encuentra y rankea los mejores perfiles compatibles.",
                color: "bg-purple-50 text-purple-700",
              },
              {
                icon: BuildingOffice2Icon,
                title: "Empresas Comprometidas",
                desc: "Las empresas deben especificar el rango salarial para acceder a los candidatos. Convocatorias serias únicamente.",
                color: "bg-blue-50 text-blue-700",
              },
              {
                icon: BellIcon,
                title: "Alertas SERVIR",
                desc: "Recibe al correo convocatorias del Estado peruano personalizadas según tu carrera y perfil de la UNSA.",
                color: "bg-green-50 text-green-700",
              },
              {
                icon: ChartBarIcon,
                title: "Métricas y Transparencia",
                desc: "Panel de control con estadísticas de postulaciones, vistas de perfil, rangos salariales del mercado y más.",
                color: "bg-orange-50 text-orange-700",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For Students ─── */}
      <section className="bg-gradient-to-br from-red-50 to-orange-50 py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-unsa-red text-sm font-medium mb-4">
              <UsersIcon className="w-4 h-4" />
              Para estudiantes y egresados
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrera empieza aquí
            </h2>
            <ul className="space-y-3 text-gray-600">
              {[
                "Crea tu perfil con CV estandarizado verificado por UDEEG",
                "Recibe alertas de empleos del Estado (SERVIR) personalizadas",
                "Sé encontrado por empresas que buscan tu perfil exacto",
                "Compara tu expectativa salarial con el mercado real",
                "Acceso a ferias laborales y webinars de empleabilidad",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-unsa-red/10 text-unsa-red flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/registro?tipo=estudiante"
              className="mt-8 inline-block bg-unsa-red text-white font-semibold px-6 py-3 rounded-xl hover:bg-unsa-red-dark transition-colors"
            >
              Crear mi perfil gratis
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-unsa-red/10 flex items-center justify-center text-2xl">👩‍💻</div>
              <div>
                <div className="font-semibold text-gray-900">María García</div>
                <div className="text-sm text-gray-500">Ing. de Sistemas · UNSA 2024</div>
              </div>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Verificado ✓</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Habilidades</div>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "Python", "SQL", "AWS", "Node.js"].map((s) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Expectativa salarial</div>
                <div className="text-sm font-medium text-gray-900">S/ 3,500 – 5,000 / mes</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Compatibilidad con puesto</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-unsa-red h-2 rounded-full" style={{ width: "88%" }} />
                  </div>
                  <span className="text-sm font-bold text-unsa-red">88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Companies ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-900 rounded-2xl p-6 text-white order-2 md:order-1">
            <div className="text-xs text-gray-400 mb-3 font-mono">// Chat de búsqueda por IA</div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <span className="text-gray-400">Empresa: </span>
                Busco un ingeniero de sistemas o computación con experiencia en Python y machine learning, mínimo 2 años, sueldo entre 4000 y 7000 soles, modalidad híbrida en Arequipa.
              </div>
              <div className="bg-unsa-red/20 border border-unsa-red/30 rounded-lg p-3">
                <span className="text-unsa-red-light">IA UNSA: </span>
                Perfecto. Encontré <strong className="text-white">8 candidatos verificados</strong> que coinciden con tu búsqueda. Los 3 mejores tienen promedio 16.2/20, experiencia en scikit-learn y TensorFlow, y están disponibles de inmediato. ¿Deseas ver los perfiles completos?
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium mb-4">
              <BuildingOffice2Icon className="w-4 h-4" />
              Para empresas
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Encuentra el talento exacto que necesitas
            </h2>
            <ul className="space-y-3 text-gray-600">
              {[
                "Describe el puesto en lenguaje natural, la IA hace el resto",
                "Accede a perfiles verificados de 52 carreras de la UNSA",
                "Ranking automático de candidatos con explicación del match",
                "Contacto directo con candidatos pre-filtrados",
                "Solo empresas que especifican rango salarial acceden a perfiles",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/registro?tipo=empresa"
              className="mt-8 inline-block bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Registrar empresa
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-unsa-red rounded-md flex items-center justify-center">
                  <AcademicCapIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">UNSA Career Connect</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                Unidad de Desarrollo Estudiantil del Egresado y Graduado (UDEEG)<br />
                Universidad Nacional de San Agustín de Arequipa
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="text-white font-medium mb-3">Plataforma</div>
                <ul className="space-y-2">
                  <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                  <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white font-medium mb-3">Soporte</div>
                <ul className="space-y-2">
                  <li><a href="mailto:udeeg@unsa.edu.pe" className="hover:text-white transition-colors">udeeg@unsa.edu.pe</a></li>
                  <li><a href="https://www.unsa.edu.pe" className="hover:text-white transition-colors">www.unsa.edu.pe</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            © 2026 UNSA Career Connect · UDEEG · Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
