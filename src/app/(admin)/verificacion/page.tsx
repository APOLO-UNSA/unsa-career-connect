"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  FlagIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { AppNavbar } from "@/components/AppNavbar";

type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Alert {
  id: string;
  field: string;
  issue: string;
  severity: AlertSeverity;
  createdAt: string;
}

interface StudentAlerts {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    career: string;
    faculty: string;
    verificationStatus: string;
    user: { email: string };
  };
  alerts: Alert[];
}

interface SummaryData {
  pending: number;
  flagged: number;
  totalAlerts: number;
  critical: number;
  high: number;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; icon: typeof ExclamationTriangleIcon }> = {
  CRITICAL: { label: "Crítico", color: "bg-red-100 text-red-700 border-red-200", icon: XCircleIcon },
  HIGH: { label: "Alto", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ExclamationTriangleIcon },
  MEDIUM: { label: "Medio", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: ExclamationTriangleIcon },
  LOW: { label: "Bajo", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FlagIcon },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revisión",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
  FLAGGED: "Marcado",
};

export default function VerificacionPage() {
  const [data, setData] = useState<{ alertsByStudent: StudentAlerts[]; summary: SummaryData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentAlerts | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/verification")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (action: "VERIFY" | "REJECT" | "FLAG_FOR_MEETING") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected.student.id,
          action,
          notes: actionNotes,
          alertIds: selected.alerts.map((a) => a.id),
        }),
      });
      const result = await res.json();
      setSuccessMsg(result.message);
      setSelected(null);
      // Refresh
      const updated = await fetch("/api/verification").then((r) => r.json());
      setData(updated);
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-unsa-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-unsa-red/10 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-unsa-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Verificación</h1>
            <p className="text-sm text-gray-500">UDEEG · Gestión de alertas y validación de perfiles</p>
          </div>
          {successMsg && (
            <div className="ml-auto bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Pendientes", value: summary.pending, color: "text-blue-600 bg-blue-50" },
              { label: "Marcados", value: summary.flagged, color: "text-orange-600 bg-orange-50" },
              { label: "Total alertas", value: summary.totalAlerts, color: "text-gray-600 bg-gray-100" },
              { label: "Críticas", value: summary.critical, color: "text-red-600 bg-red-50" },
              { label: "Altas", value: summary.high, color: "text-orange-600 bg-orange-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className={`text-3xl font-bold mb-1 ${s.color.split(" ")[0]}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alert List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-4">
              Casos con alertas ({data?.alertsByStudent.length ?? 0})
            </h2>
            {data?.alertsByStudent.map((item) => {
              const worstSeverity = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as AlertSeverity[]).find(
                (s) => item.alerts.some((a) => a.severity === s)
              ) ?? "LOW";
              const config = SEVERITY_CONFIG[worstSeverity];

              return (
                <button
                  key={item.student.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
                    selected?.student.id === item.student.id ? "ring-2 ring-unsa-red" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {item.student.firstName} {item.student.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{item.student.career}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${config.color}`}>
                          {item.alerts.length} alerta{item.alerts.length > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-400">
                          {STATUS_LABELS[item.student.verificationStatus]}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {data?.alertsByStudent.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p className="text-sm">No hay alertas pendientes</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white border border-gray-100 rounded-2xl h-96 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">Selecciona un caso para revisar</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                {/* Student info */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <div className="w-14 h-14 rounded-full bg-unsa-red/10 flex items-center justify-center text-xl font-bold text-unsa-red">
                    {selected.student.firstName[0]}{selected.student.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selected.student.firstName} {selected.student.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{selected.student.career} · {selected.student.faculty}</p>
                    <p className="text-xs text-gray-400">{selected.student.user.email}</p>
                  </div>
                  <span className="ml-auto text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                    {STATUS_LABELS[selected.student.verificationStatus]}
                  </span>
                </div>

                {/* Alerts */}
                <h4 className="font-semibold text-gray-900 mb-3">Alertas detectadas</h4>
                <div className="space-y-3 mb-6">
                  {selected.alerts.map((alert) => {
                    const config = SEVERITY_CONFIG[alert.severity];
                    return (
                      <div key={alert.id} className={`border rounded-xl p-4 ${config.color}`}>
                        <div className="flex items-start gap-2">
                          <config.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wide">{config.label}</span>
                              <span className="text-xs opacity-60">campo: {alert.field}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{alert.issue}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Notas de la revisión (opcional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Ej: Se verificó promedio con registros UNSA. Experiencia confirmada vía llamada..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("VERIFY")}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleAction("FLAG_FOR_MEETING")}
                    disabled={actionLoading}
                    className="flex-1 bg-orange-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Citar a reunión
                  </button>
                  <button
                    onClick={() => handleAction("REJECT")}
                    disabled={actionLoading}
                    className="bg-red-100 text-red-700 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-200 transition-colors disabled:opacity-60"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3">
                  "Citar a reunión" programa una verificación presencial en oficinas UDEEG
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
