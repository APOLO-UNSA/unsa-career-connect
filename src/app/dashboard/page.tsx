"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const role = (session.user as { role?: string })?.role;
    if (role === "STUDENT") router.replace("/oportunidades");
    else if (role === "COMPANY") router.replace("/buscar");
    else if (role === "ADMIN") router.replace("/verificacion");
    else router.replace("/login");
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-unsa-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
