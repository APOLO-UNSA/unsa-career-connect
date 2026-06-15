"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AcademicCapIcon, BuildingOffice2Icon, UsersIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { ALL_CAREERS } from "@/lib/types";

type Tipo = "estudiante" | "empresa" | null;

export default function RegistroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo") as Tipo;

  const [tipo, setTipo] = useState<Tipo>(tipoParam);
  const [step, setStep] = useState(tipoParam ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Campos comunes
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estudiante
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [career, setCareer] = useState("");

  // Empresa
  const [companyName, setCompanyName] = useState("");
  const [ruc, setRuc] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        tipo === "estudiante"
          ? { tipo, email, password, firstName, lastName, career }
          : { tipo, email, password, companyName, ruc };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar.");
        setLoading(false);
        return;
      }

      // Auto-login tras registro exitoso
      await signIn("credentials", { email, password, redirect: false });
      router.push(tipo === "estudiante" ? "/(estudiante)/oportunidades" : "/(empresa)/buscar");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  const CAREERS = [...ALL_CAREERS].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-unsa-red rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg leading-tight">UNSA Career Connect</div>
              <div className="text-xs text-gray-500">UDEEG · Bolsa de Trabajo</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Paso 1: elegir tipo */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
              <p className="text-sm text-gray-500 mb-6">¿Cómo quieres usar la plataforma?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setTipo("estudiante"); setStep(2); }}
                  className="border-2 border-gray-200 hover:border-unsa-red rounded-xl p-5 text-center transition-colors group"
                >
                  <UsersIcon className="w-8 h-8 text-gray-400 group-hover:text-unsa-red mx-auto mb-2 transition-colors" />
                  <div className="font-semibold text-gray-800 text-sm">Estudiante</div>
                  <div className="text-xs text-gray-400 mt-1">o egresado UNSA</div>
                </button>
                <button
                  onClick={() => { setTipo("empresa"); setStep(2); }}
                  className="border-2 border-gray-200 hover:border-unsa-red rounded-xl p-5 text-center transition-colors group"
                >
                  <BuildingOffice2Icon className="w-8 h-8 text-gray-400 group-hover:text-unsa-red mx-auto mb-2 transition-colors" />
                  <div className="font-semibold text-gray-800 text-sm">Empresa</div>
                  <div className="text-xs text-gray-400 mt-1">buscar talento</div>
                </button>
              </div>
            </>
          )}

          {/* Paso 2: datos */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-sm">←</button>
                <h1 className="text-xl font-bold text-gray-900">
                  {tipo === "estudiante" ? "Registro estudiante" : "Registro empresa"}
                </h1>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {tipo === "estudiante" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombres</label>
                        <input
                          type="text" required value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos</label>
                        <input
                          type="text" required value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Carrera</label>
                      <select
                        required value={career}
                        onChange={(e) => setCareer(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red bg-white"
                      >
                        <option value="">Selecciona tu carrera...</option>
                        {CAREERS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {tipo === "empresa" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                      <input
                        type="text" required value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">RUC</label>
                      <input
                        type="text" value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        placeholder="20xxxxxxxxx"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {tipo === "estudiante" ? "Email institucional (@unsa.edu.pe)" : "Email corporativo"}
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tipo === "estudiante" ? "tu@unsa.edu.pe" : "contacto@empresa.com"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password" required minLength={8} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-unsa-red text-white font-semibold py-2.5 rounded-lg hover:bg-unsa-red-dark transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-unsa-red font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
