"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { AcademicCapIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  STUDENT: { label: "Estudiante", color: "bg-blue-100 text-blue-700" },
  COMPANY: { label: "Empresa", color: "bg-purple-100 text-purple-700" },
  ADMIN:   { label: "Admin UDEEG", color: "bg-red-100 text-unsa-red" },
};

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/oportunidades",
  COMPANY: "/buscar",
  ADMIN:   "/verificacion",
};

const ROLE_NAV: Record<string, { label: string; href: string }[]> = {
  STUDENT: [
    { label: "Oportunidades en el sector público", href: "/oportunidades" },
    { label: "Mi Perfil", href: "/perfil" },
  ],
  COMPANY: [],
  ADMIN:   [],
};

export function AppNavbar() {
  const { data: session } = useSession();
  if (!session) return null;

  const role = (session.user as { role?: string })?.role ?? "";
  const name = session.user?.name ?? session.user?.email ?? "";
  const badge = ROLE_LABELS[role];
  const home  = ROLE_HOME[role] ?? "/";
  const navLinks = ROLE_NAV[role] ?? [];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href={home} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-unsa-red rounded-md flex items-center justify-center">
              <AcademicCapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              UNSA <span className="text-unsa-red">Career Connect</span>
            </span>
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-unsa-red font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {badge && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.color} hidden sm:inline`}>
              {badge.label}
            </span>
          )}
          <span className="text-sm text-gray-700 font-medium hidden md:block max-w-[140px] truncate">
            {name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
