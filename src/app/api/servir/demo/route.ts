/**
 * GET /api/servir/demo
 * Endpoint público (sin auth) para la demo de la hackathon.
 * Devuelve el dataset completo de convocatorias simuladas
 * y las filtradas por carrera si se proporciona ?career=...
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllServirJobs, filterJobsForStudent } from "@/lib/servir";
import { ALL_CAREERS } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const career = searchParams.get("career");
  const allJobs = getAllServirJobs();

  if (career && career !== "all") {
    const filtered = filterJobsForStudent(career, []);
    return NextResponse.json({
      career,
      total: filtered.length,
      totalPool: allJobs.length,
      matchRate: Math.round((filtered.length / allJobs.length) * 100),
      jobs: filtered,
    });
  }

  // Sin filtro: devuelve todo el pool + stats generales
  const careerStats = ALL_CAREERS.map((c) => ({
    career: c,
    matches: filterJobsForStudent(c, []).length,
  })).filter((s) => s.matches > 0)
    .sort((a, b) => b.matches - a.matches);

  // Ciudades únicas
  const locations = [...new Set(allJobs.flatMap((j) => j.location.split(" / ")))].sort();

  // Rango salarial promedio
  const salaries = allJobs
    .map((j) => {
      if (!j.salary) return null;
      const nums = j.salary.match(/\d[\d,]*/g);
      if (!nums || nums.length < 2) return null;
      return (parseInt(nums[0].replace(/,/g, "")) + parseInt(nums[1].replace(/,/g, ""))) / 2;
    })
    .filter(Boolean) as number[];

  const avgSalary = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);

  return NextResponse.json({
    total: allJobs.length,
    careersWithJobs: careerStats.length,
    locations,
    avgSalary,
    topCareers: careerStats.slice(0, 10),
    jobs: allJobs,
  });
}
