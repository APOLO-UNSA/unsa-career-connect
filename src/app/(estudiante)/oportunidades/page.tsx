"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BellIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
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

  const profileId = (session?.user as { profileId?: string })?.profileId;

  useEffect(() => {
    if (!profileId) return;
    fetch(`/api/servir?studentId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
        setCareer(data.career ?? "");
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  const daysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-unsa-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-unsa-red/10 flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-unsa-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oportunidades para ti</h1>
            <p className="text-sm text-gray-500">
              {total} convocatoria{total !== 1 ? "s" : ""} de SERVIR compatibles con {career}
            </p>
          </div>
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
        {jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">No hay convocatorias en este momento</p>
            <p className="text-sm mt-1">Vuelve a revisar mañana o actualiza tu perfil para mejorar los resultados.</p>
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
