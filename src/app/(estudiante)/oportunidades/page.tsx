"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AppNavbar } from "@/components/AppNavbar";
import {
  BellIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ServirJob {
  title: string;
  institution: string;
  url: string;
  salary: string | null;
  location: string;
  deadline: string | null;
  requirements: string;
}

export default function OportunidadesPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<ServirJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState("");
  const [total, setTotal] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const profileId = (session?.user as { profileId?: string })?.profileId;

  function fetchJobs(location: string) {
    if (!profileId) return;
    setLoading(true);
    const params = new URLSearchParams({ studentId: profileId });
    if (location !== "all") params.set("location", location);

    fetch(`/api/servir?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
        setCareer(data.career ?? "");
        setLocations(data.locations ?? []);
        setUpdatedAt(data.updatedAt ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchJobs(selectedLocation);
  }, [profileId, selectedLocation]);

  const daysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-unsa-red/10 flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-unsa-red" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oportunidades en el sector público</h1>
              <p className="text-sm text-gray-500">
                {loading ? "Cargando..." : `${total} convocatoria${total !== 1 ? "s" : ""} compatibles con ${career}`}
              </p>
            </div>
          </div>

          {/* Filtro de localidad */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <MapPinIcon className="w-4 h-4 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
            >
              <option value="all">Todas las regiones</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Badge SERVIR actualizado */}
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Actualizado con la base de datos de convocatorias del Estado — SERVIR
            {updatedAt && (
              <span className="text-green-500 ml-1">
                · {new Date(updatedAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </span>
          <button
            onClick={() => fetchJobs(selectedLocation)}
            className="text-gray-400 hover:text-unsa-red transition-colors"
            title="Actualizar"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <BuildingOffice2Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>¿Qué es SERVIR?</strong> Es la Autoridad Nacional del Servicio Civil del Perú.
            Estas convocatorias son del sector público y ofrecen estabilidad laboral, beneficios CAS y
            posibilidad de carrera en el Estado. Filtramos solo las compatibles con tu carrera.
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-unsa-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">
              {selectedLocation !== "all"
                ? `No hay convocatorias en ${selectedLocation} para tu carrera`
                : "No hay convocatorias en este momento"}
            </p>
            <p className="text-sm mt-1">
              {selectedLocation !== "all" && (
                <button
                  onClick={() => setSelectedLocation("all")}
                  className="text-unsa-red hover:underline"
                >
                  Ver todas las regiones
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => {
              const days = daysUntilDeadline(job.deadline);
              const isUrgent = days !== null && days <= 5;

              return (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        {isUrgent && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            ¡Cierra pronto!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-unsa-red font-medium">{job.institution}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3.5 h-3.5" />
                            {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        {job.deadline && (
                          <span className={`flex items-center gap-1 ${isUrgent ? "text-red-600 font-medium" : ""}`}>
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Cierra: {new Date(job.deadline).toLocaleDateString("es-PE")}
                            {days !== null && ` (${days} días)`}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.requirements}</p>
                    </div>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-unsa-red text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-unsa-red-dark transition-colors flex-shrink-0"
                    >
                      Ver convocatoria
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Datos de SERVIR – Autoridad Nacional del Servicio Civil · Actualización diaria
        </p>
      </div>
    </div>
  );
}
