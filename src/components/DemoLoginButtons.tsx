"use client";

import { useState } from "react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  {
    role: "Admin UDEEG",
    emoji: "🛡️",
    email: "admin@udeeg.unsa.edu.pe",
    password: "admin1234",
    desc: "Panel de verificación",
    color: "border-gray-300 bg-gray-900/5",
    badge: "bg-gray-200 text-gray-700",
  },
  {
    role: "Empresa 1",
    emoji: "🏢",
    email: "rrhh@mineroandino.pe",
    password: "empresa1234",
    desc: "Minero Andino S.A.",
    color: "border-blue-200 bg-blue-500/5",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    role: "Empresa 2",
    emoji: "💻",
    email: "talento@tecnosur.com.pe",
    password: "empresa1234",
    desc: "TecnoSur Systems",
    color: "border-blue-200 bg-blue-500/5",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    role: "Estudiante 1",
    emoji: "🎓",
    email: "ana.garcia@unsa.edu.pe",
    password: "estudiante1234",
    desc: "Ing. de Sistemas",
    color: "border-red-200 bg-red-500/5",
    badge: "bg-red-100 text-red-700",
  },
  {
    role: "Estudiante 2",
    emoji: "⚗️",
    email: "sofia.condori@unsa.edu.pe",
    password: "estudiante1234",
    desc: "Economía",
    color: "border-red-200 bg-red-500/5",
    badge: "bg-red-100 text-red-700",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="text-white/50 hover:text-white transition-colors text-xs px-1.5 py-0.5 rounded"
      title="Copiar"
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

export function DemoLoginButtons() {
  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/80 text-sm font-medium">
            🔑 Credenciales de demo
          </p>
          <Link
            href="/login"
            className="text-xs bg-white text-unsa-red font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Ir al login →
          </Link>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3"
            >
              <span className="text-lg flex-shrink-0">{acc.emoji}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white text-xs font-semibold">{acc.role}</span>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/50 text-xs">{acc.desc}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-white/40 text-xs w-14">Email:</span>
                    <code className="text-white/90 text-xs font-mono">{acc.email}</code>
                    <CopyButton text={acc.email} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/40 text-xs w-14">Clave:</span>
                    <code className="text-white/90 text-xs font-mono">{acc.password}</code>
                    <CopyButton text={acc.password} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center mt-3">
          Copia las credenciales e ingrésalas en el login
        </p>
      </div>
    </div>
  );
}
