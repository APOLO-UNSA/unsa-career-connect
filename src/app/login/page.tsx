"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

const DEMO_ACCOUNTS = [
  { role: "Admin UDEEG",   emoji: "🛡️", email: "admin@udeeg.unsa.edu.pe",  password: "admin1234",      desc: "Panel verificación" },
  { role: "Empresa 1",     emoji: "🏢", email: "rrhh@mineroandino.pe",       password: "empresa1234",    desc: "Minero Andino S.A." },
  { role: "Empresa 2",     emoji: "💻", email: "talento@tecnosur.com.pe",    password: "empresa1234",    desc: "TecnoSur Systems" },
  { role: "Estudiante 1",  emoji: "🎓", email: "maria.garcia@unsa.edu.pe",   password: "estudiante1234", desc: "Ing. de Sistemas" },
  { role: "Estudiante 2",  emoji: "⚗️", email: "sofia.condori@unsa.edu.pe", password: "estudiante1234", desc: "Economía" },
];

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="ml-1 text-gray-400 hover:text-unsa-red transition-colors text-xs"
      title="Copiar"
    >
      {done ? "✓" : "⎘"}
    </button>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push(callbackUrl === "/" ? "/dashboard" : callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-unsa-red rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg leading-tight">UNSA Career Connect</div>
              <div className="text-xs text-gray-500">UDEEG · Bolsa de Trabajo</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mb-6">Accede a tu cuenta con tu email institucional.</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@unsa.edu.pe"
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-unsa-red text-white font-semibold py-2.5 rounded-lg hover:bg-unsa-red-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Credenciales de demo */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Credenciales de demo — haz clic para autocompletar</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="w-full flex items-center gap-3 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 rounded-lg px-3 py-2 transition-colors text-left group"
                >
                  <span className="text-base flex-shrink-0">{acc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-unsa-red">{acc.role}</span>
                      <span className="text-xs text-gray-400">· {acc.desc}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-gray-500 truncate">{acc.email}</code>
                      <CopyBtn text={acc.email} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 group-hover:text-unsa-red flex-shrink-0">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-unsa-red font-medium hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
