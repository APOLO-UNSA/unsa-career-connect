"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  BellIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ALL_CAREERS } from "@/lib/types";

interface ServirJob {
  title: string;
  institution: string;
  url: string;
  salary: string | null;
  location: string;
  deadline: string | null;
  requirements: string;
  tags?: string[];
}

interface DemoStats {
  total: number;
  careersWithJobs: number;
  locations: string[];
  avgSalary: number;
  topCareers: { career: string; matches: number }[];
  jobs: ServirJob[];
}

interface FilterResult {
  career: string;
  total: number;
  totalPool: number;
  matchRate: number;
  jobs: ServirJob[];
}

// Simula los pasos de procesamiento del sistema
const PIPELINE_STEPS = [
  { id: 1, label: "Consultando portal SERVIR...", duration: 700 },
  { id: 2, label: "Descargando convocatorias activas...", duration: 900 },
  { id: 3, label: "Analizando compatibilidad con perfil...", duration: 800 },
  { id: 4, label: "Filtrando por carrera y habilidades...", duration: 600 },
  { id: 5, label: "Preparando alertas personalizadas...", duration: 500 },
];

function PipelineAnimation({
  active,
  onDone,
}: {
  active: boolean;
  onDone: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!active) {
      setCurrentStep(0);
      setDoneSteps([]);
      return;
    }

    let step = 0;
    const runStep = () => {
      if (step >= PIPELINE_STEPS.length) {
        onDone();
        return;
      }
      setCurrentStep(step + 1);
      setTimeout(() => {
        setDoneSteps((prev) => [...prev, step + 1]);
        step++;
        runStep();
      }, PIPELINE_STEPS[step].duration);
    };
    runStep();
  }, [active, onDone]);

  if (!active && doneSteps.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-700">
      <div className="text-xs text-gray-400 font-mono mb-4">// Pipeline SERVIR en ejecución</div>
      <div className="space-y-2">
        {PIPELINE_STEPS.map((step) => {
          const isDone = doneSteps.includes(step.id);
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isDone ? "bg-green-500" : isActive ? "bg-unsa-red animate-pulse" : "bg-gray-700"
              }`}>
                {isDone ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                ) : isActive ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                )}
              </div>
              <span className={`text-sm font-mono transition-colors ${
                isDone ? "text-green-400" : isActive ? "text-white" : "text-gray-600"
              }`}>
                {isDone ? "✓ " : isActive ? "> " : "  "}{step.label}
              </span>
              {isActive && (
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-unsa-red rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailPreview({ career, jobs, name }: { career: string; jobs: ServirJob[]; name: string }) {
  const preview = jobs.slice(0, 3);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
      {/* Email client header */}
      <div className="bg-gray-100 border-b px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 ml-2">
          Para: {name.toLowerCase().replace(" ", ".")}@unsa.edu.pe
        </div>
      </div>
      {/* Email body */}
      <div className="p-5">
        <div className="bg-unsa-red py-4 px-5 rounded-xl text-white text-center mb-5">
          <div className="font-bold text-base">UNSA Career Connect</div>
          <div className="text-xs text-red-200 mt-0.5">Bolsa de Trabajo · UDEEG</div>
        </div>
        <div className="text-sm text-gray-800 mb-1 font-semibold">Hola, {name} 👋</div>
        <p className="text-sm text-gray-600 mb-4">
          Encontramos <span className="font-bold text-unsa-red">{jobs.length} nueva(s) convocatoria(s) del Estado</span> compatibles
          con tu carrera de <span className="font-medium">{career}</span>.
        </p>
        <div className="space-y-3">
          {preview.map((job, i) => (
            <div key={i} className={`rounded-xl p-3 border ${i === 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
              <div className={`font-medium text-sm ${i === 0 ? "text-unsa-red" : "text-gray-800"}`}>
                {job.title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{job.institution}</div>
              <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                <span>{job.salary ?? "Ver convocatoria"}</span>
                <span>·</span>
                <span>{job.location}</span>
                {job.deadline && (
                  <>
                    <span>·</span>
                    <span className={i === 0 ? "text-red-500 font-medium" : ""}>
                      Cierre: {new Date(job.deadline).toLocaleDateString("es-PE")}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
          {jobs.length > 3 && (
            <div className="text-center text-xs text-gray-400 py-1">
              + {jobs.length - 3} convocatoria(s) más en el portal →
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <div className="inline-block bg-unsa-red text-white text-xs font-semibold px-5 py-2.5 rounded-lg">
            Ver todas las convocatorias
          </div>
        </div>
        <div className="mt-4 pt-3 border-t text-center text-xs text-gray-400">
          UNSA Career Connect · UDEEG · Arequipa, Perú
        </div>
      </div>
    </div>
  );
}

function SalaryBadge({ salary }: { salary: string | null }) {
  if (!salary) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-medium">
      <CurrencyDollarIcon className="w-3 h-3" />
      {salary}
    </span>
  );
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  const urgent = days <= 7;
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
      urgent ? "bg-red-50 text-red-600 font-medium" : "bg-gray-100 text-gray-500"
    }`}>
      <CalendarIcon className="w-3 h-3" />
      {days > 0 ? `${days} días` : "Vencida"}
    </span>
  );
}

export default function DemoPage() {
  const [allData, setAllData] = useState<DemoStats | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>("");
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineDone, setPipelineDone] = useState(false);
  const [demoName] = useState("María García");
  const [showEmail, setShowEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "stats" | "email">("jobs");
  const [searchQuery, setSearchQuery] = useState("");

  // Carga inicial: todas las convocatorias + estadísticas generales
  useEffect(() => {
    fetch("/api/servir/demo")
      .then((r) => r.json())
      .then(setAllData);
  }, []);

  const handleCareerSelect = useCallback(async (career: string) => {
    setSelectedCareer(career);
    setFilterResult(null);
    setPipelineDone(false);
    setShowEmail(false);
    if (!career || career === "all") return;
    setPipelineActive(true);
  }, []);

  const onPipelineDone = useCallback(async () => {
    setPipelineActive(false);
    const res = await fetch(`/api/servir/demo?career=${encodeURIComponent(selectedCareer)}`);
    const data = await res.json();
    setFilterResult(data);
    setPipelineDone(true);
  }, [selectedCareer]);

  const displayJobs = filterResult
    ? filterResult.jobs
    : allData?.jobs ?? [];

  const filteredBySearch = searchQuery.trim()
    ? displayJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.requirements.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayJobs;

  const isFiltered = !!selectedCareer && selectedCareer !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <div className="bg-unsa-red text-white px-4 py-5 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <BellIcon className="w-6 h-6 text-red-200" />
            <h1 className="text-2xl font-bold">Demo SERVIR – Simulación de Alertas</h1>
            <span className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
              UNSA Career Connect · Hackathon 2026
            </span>
          </div>
          <p className="text-red-200 text-sm">
            Selecciona una carrera de la UNSA para ver cómo el sistema filtra y envía convocatorias del Estado personalizadas.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ─── Selector de carrera ─── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Simular perfil de estudiante/egresado
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedCareer}
                  onChange={(e) => handleCareerSelect(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red bg-white"
                >
                  <option value="">— Selecciona una carrera UNSA —</option>
                  <option value="all">Todas las carreras</option>
                  <optgroup label="─── Carreras disponibles ───">
                    {ALL_CAREERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {selectedCareer && selectedCareer !== "all" && (
                  <button
                    onClick={() => {
                      setSelectedCareer("");
                      setFilterResult(null);
                      setPipelineDone(false);
                    }}
                    className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats rápidas */}
            {allData && (
              <div className="flex gap-4 text-center">
                <div className="px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-unsa-red">{allData.total}</div>
                  <div className="text-xs text-gray-500">Convocatorias</div>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">{allData.careersWithJobs}</div>
                  <div className="text-xs text-gray-500">Carreras cubiertas</div>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">
                    S/ {(allData.avgSalary / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-gray-500">Sueldo promedio</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Pipeline Animation ─── */}
        <PipelineAnimation active={pipelineActive} onDone={onPipelineDone} />

        {/* ─── Resultado del filtrado ─── */}
        {pipelineDone && filterResult && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">
                    {filterResult.total} convocatoria{filterResult.total !== 1 ? "s" : ""} encontrada{filterResult.total !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-green-700">
                    De un pool de <strong>{filterResult.totalPool}</strong> convocatorias SERVIR,
                    el <strong>{filterResult.matchRate}%</strong> aplica para <em>{filterResult.career}</em>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowEmail(true); setActiveTab("email"); }}
                className="flex items-center gap-2 bg-unsa-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-unsa-red-dark transition-colors"
              >
                <BellIcon className="w-4 h-4" />
                Ver alerta de email
              </button>
            </div>

            {/* Barra de progreso del match */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-green-700 mb-1">
                <span>Tasa de coincidencia con {filterResult.career}</span>
                <span className="font-bold">{filterResult.matchRate}%</span>
              </div>
              <div className="bg-green-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${filterResult.matchRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {[
            { id: "jobs", label: "Convocatorias", icon: BuildingOffice2Icon },
            { id: "stats", label: "Estadísticas", icon: ChartBarIcon },
            ...(showEmail ? [{ id: "email", label: "Vista de Email", icon: BellIcon }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-unsa-red text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "jobs" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "jobs" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {filteredBySearch.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab: Convocatorias ─── */}
        {activeTab === "jobs" && (
          <div>
            {/* Buscador */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, institución o requisitos..."
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 bg-white"
              />
              {isFiltered && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-unsa-red/10 text-unsa-red px-2 py-1 rounded-md">
                  <FunnelIcon className="w-3 h-3" />
                  {selectedCareer}
                </div>
              )}
            </div>

            {/* Grid de convocatorias */}
            <div className="space-y-3">
              {filteredBySearch.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                  <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p>No se encontraron convocatorias</p>
                </div>
              ) : (
                filteredBySearch.map((job, i) => {
                  const isHighlighted = isFiltered && filterResult?.jobs.includes(job);
                  return (
                    <div
                      key={i}
                      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
                        isHighlighted
                          ? "border-green-200 bg-green-50/30 ring-1 ring-green-100"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icono institución */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                          isHighlighted ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          🏛️
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 leading-tight">{job.title}</h3>
                              <p className={`text-sm mt-0.5 font-medium ${isHighlighted ? "text-green-700" : "text-unsa-red"}`}>
                                {job.institution}
                              </p>
                            </div>
                            {isHighlighted && (
                              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Match
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                            {job.requirements}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3 items-center">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                            <SalaryBadge salary={job.salary} />
                            <DeadlineBadge deadline={job.deadline} />

                            {/* Tags de carrera */}
                            {isHighlighted && job.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}

                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto flex items-center gap-1.5 text-xs text-unsa-red hover:underline font-medium"
                            >
                              Ver en SERVIR
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── Tab: Estadísticas ─── */}
        {activeTab === "stats" && allData && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top careers */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-unsa-red" />
                Carreras con más convocatorias
              </h3>
              <div className="space-y-3">
                {allData.topCareers.map((c, i) => (
                  <div key={c.career}>
                    <div className="flex justify-between text-sm mb-1">
                      <button
                        onClick={() => { handleCareerSelect(c.career); setActiveTab("jobs"); }}
                        className="text-gray-700 hover:text-unsa-red transition-colors font-medium text-left"
                      >
                        {i + 1}. {c.career}
                      </button>
                      <span className="text-gray-500 font-medium">{c.matches}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-unsa-red h-2 rounded-full transition-all"
                        style={{ width: `${(c.matches / allData.topCareers[0].matches) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-unsa-red" />
                Ubicaciones disponibles
              </h3>
              <div className="flex flex-wrap gap-2">
                {allData.locations.map((loc) => {
                  const count = allData.jobs.filter((j) => j.location.includes(loc)).length;
                  return (
                    <span key={loc} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span>{loc}</span>
                      <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md">{count}</span>
                    </span>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen del pool SERVIR simulado</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total convocatorias", value: allData.total },
                    { label: "Carreras cubiertas", value: allData.careersWithJobs },
                    { label: "Sueldo promedio", value: `S/ ${allData.avgSalary.toLocaleString()}` },
                    { label: "Ciudades", value: allData.locations.length },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-unsa-red">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info sobre SERVIR */}
            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <BuildingOffice2Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Nota sobre esta demo</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Este dataset contiene <strong>{allData.total} convocatorias simuladas</strong> basadas en
                    publicaciones reales de SERVIR (portal talento.servir.gob.pe) e instituciones del Estado peruano.
                    En la versión de producción, el sistema consulta automáticamente el portal de SERVIR cada día,
                    descarga las convocatorias activas y las filtra en tiempo real según el perfil verificado
                    de cada egresado de la UNSA, enviando el email solo a quienes realmente aplican.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Email Preview ─── */}
        {activeTab === "email" && showEmail && filterResult && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-5">
              <h3 className="font-semibold text-gray-900">Vista previa del email de alerta</h3>
              <p className="text-sm text-gray-500">
                Esto es lo que recibiría <strong>{demoName}</strong> ({filterResult.career}) en su correo
              </p>
            </div>
            <EmailPreview career={filterResult.career} jobs={filterResult.jobs} name={demoName} />
            <p className="text-xs text-center text-gray-400 mt-3">
              Email HTML responsivo · Enviado vía Nodemailer (SMTP)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
