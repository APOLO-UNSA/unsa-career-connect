"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import {
  PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon,
  BriefcaseIcon, LanguageIcon, WrenchScrewdriverIcon,
  ShieldCheckIcon, ExclamationTriangleIcon, PlusIcon,
  BookOpenIcon, AcademicCapIcon,
} from "@heroicons/react/24/outline";

const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATE: "Disponible inmediatamente",
  IN_30_DAYS: "Disponible en 30 días",
  IN_60_DAYS: "Disponible en 60 días",
  IN_90_DAYS: "Disponible en 90 días",
  INTERNSHIP_ONLY: "Solo prácticas",
  PART_TIME_ONLY: "Solo part-time",
};

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  VERIFIED:  { label: "Verificado ✓",  color: "bg-green-100 text-green-700" },
  IN_REVIEW: { label: "En revisión",   color: "bg-yellow-100 text-yellow-700" },
  PENDING:   { label: "Pendiente",     color: "bg-gray-100 text-gray-600" },
  FLAGGED:   { label: "Con alertas",   color: "bg-red-100 text-red-700" },
  REJECTED:  { label: "Rechazado",     color: "bg-red-100 text-red-700" },
};

const CERT_TYPES = ["Curso", "Diplomado", "Seminario", "Programa de Especialización"];
const POSGRADO_TYPES = ["Maestría", "Doctorado", "Segunda Especialidad"];

interface Certification { id: string; name: string; issuer: string; issueDate: string | null; credentialUrl: string | null }
interface Education { id: string; degree: string; field: string | null; institution: string; startYear: number; endYear: number | null; isCurrent: boolean }
interface Student {
  id: string; firstName: string; lastName: string; career: string; faculty: string | null;
  headline: string | null; summary: string | null; phone: string | null;
  linkedinUrl: string | null; portfolioUrl: string | null; gpa: number | null;
  salaryExpectation: number | null; salaryExpectationMax: number | null;
  availability: string; workModality: string | null; graduationYear: number | null;
  admissionYear: number | null; graduationStatus: string; verificationStatus: string;
  profileScore: number | null;
  skills: { id: string; name: string; category: string; level: number; yearsUsed: number | null }[];
  experience: { id: string; company: string; position: string; description: string | null; startDate: string; endDate: string | null; isCurrent: boolean; salary: number | null }[];
  languages: { id: string; language: string; level: string; certified: boolean }[];
  certifications: Certification[];
  education: Education[];
  user: { email: string };
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Formación complementaria
  const [certs, setCerts] = useState<Certification[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ tipo: "Curso", name: "", issuer: "", issueDate: "", credentialUrl: "" });
  const [savingCert, setSavingCert] = useState(false);

  // Posgrado
  const [education, setEducation] = useState<Education[]>([]);
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({ tipo: "Maestría", field: "", institution: "", startYear: "", endYear: "", isCurrent: false });
  const [savingEdu, setSavingEdu] = useState(false);

  const profileId = (session?.user as { profileId?: string })?.profileId;

  const [form, setForm] = useState({
    headline: "", summary: "", phone: "", linkedinUrl: "", portfolioUrl: "",
    gpa: "", salaryExpectation: "", salaryExpectationMax: "", availability: "IMMEDIATE", workModality: "",
  });

  useEffect(() => {
    if (!profileId) return;
    fetch(`/api/students/${profileId}`)
      .then((r) => r.json())
      .then((data: Student) => {
        setStudent(data);
        setCerts(data.certifications ?? []);
        setEducation(data.education ?? []);
        setForm({
          headline: data.headline ?? "", summary: data.summary ?? "", phone: data.phone ?? "",
          linkedinUrl: data.linkedinUrl ?? "", portfolioUrl: data.portfolioUrl ?? "",
          gpa: data.gpa?.toString() ?? "", salaryExpectation: data.salaryExpectation?.toString() ?? "",
          salaryExpectationMax: data.salaryExpectationMax?.toString() ?? "",
          availability: data.availability ?? "IMMEDIATE", workModality: data.workModality ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    const res = await fetch(`/api/students/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: form.headline || null, summary: form.summary || null, phone: form.phone || null,
        linkedinUrl: form.linkedinUrl || null, portfolioUrl: form.portfolioUrl || null,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        salaryExpectation: form.salaryExpectation ? parseInt(form.salaryExpectation) : null,
        salaryExpectationMax: form.salaryExpectationMax ? parseInt(form.salaryExpectationMax) : null,
        availability: form.availability, workModality: form.workModality || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setStudent((prev) => prev ? { ...prev, ...data.student } : prev);
      setEditing(false);
      setSaveMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSaveMsg(""), 3000);
    } else {
      setSaveMsg("Error al guardar. Verifica los datos.");
    }
  }

  async function handleAddCert() {
    if (!profileId || !certForm.name || !certForm.issuer) return;
    setSavingCert(true);
    const fullName = `${certForm.tipo} en ${certForm.name}`;
    const res = await fetch(`/api/students/${profileId}/certifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, issuer: certForm.issuer, issueDate: certForm.issueDate || null, credentialUrl: certForm.credentialUrl || null }),
    });
    if (res.ok) {
      const newCert = await res.json();
      setCerts((prev) => [...prev, newCert]);
      setCertForm({ tipo: "Curso", name: "", issuer: "", issueDate: "", credentialUrl: "" });
      setShowCertForm(false);
    }
    setSavingCert(false);
  }

  async function handleDeleteCert(certId: string) {
    if (!profileId) return;
    await fetch(`/api/students/${profileId}/certifications?certId=${certId}`, { method: "DELETE" });
    setCerts((prev) => prev.filter((c) => c.id !== certId));
  }

  async function handleAddEdu() {
    if (!profileId || !eduForm.field || !eduForm.institution || !eduForm.startYear) return;
    setSavingEdu(true);
    const res = await fetch(`/api/students/${profileId}/education`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        degree: eduForm.tipo, field: eduForm.field, institution: eduForm.institution,
        startYear: parseInt(eduForm.startYear), endYear: eduForm.endYear ? parseInt(eduForm.endYear) : null,
        isCurrent: eduForm.isCurrent,
      }),
    });
    if (res.ok) {
      const newEdu = await res.json();
      setEducation((prev) => [...prev, newEdu]);
      setEduForm({ tipo: "Maestría", field: "", institution: "", startYear: "", endYear: "", isCurrent: false });
      setShowEduForm(false);
    }
    setSavingEdu(false);
  }

  async function handleDeleteEdu(eduId: string) {
    if (!profileId) return;
    await fetch(`/api/students/${profileId}/education?eduId=${eduId}`, { method: "DELETE" });
    setEducation((prev) => prev.filter((e) => e.id !== eduId));
  }

  async function handleDelete() {
    if (!profileId) return;
    setDeleting(true);
    const res = await fetch(`/api/students/${profileId}`, { method: "DELETE" });
    if (res.ok) { await signOut({ redirect: false }); router.push("/"); }
    else { setDeleting(false); setShowDeleteConfirm(false); }
  }

  const isGraduate = student?.graduationStatus === "GRADUATED" || student?.graduationStatus === "TITLED";

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><AppNavbar />
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-unsa-red border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen bg-gray-50"><AppNavbar />
      <div className="text-center py-24 text-gray-500">No se encontró tu perfil.</div>
    </div>
  );

  const status = STATUS_STYLES[student.verificationStatus] ?? STATUS_STYLES.PENDING;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Cabecera / info personal ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-unsa-red to-unsa-red-dark text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
                <p className="text-sm text-gray-500">{student.career}</p>
                {student.faculty && <p className="text-xs text-gray-400">{student.faculty}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  {student.profileScore != null && (
                    <span className="text-xs text-gray-400">Perfil {student.profileScore}% completo</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm border border-gray-200 hover:border-unsa-red text-gray-600 hover:text-unsa-red px-3 py-1.5 rounded-lg transition-colors">
                  <PencilSquareIcon className="w-4 h-4" /> Editar
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm bg-unsa-red text-white px-3 py-1.5 rounded-lg hover:bg-unsa-red-dark transition-colors disabled:opacity-60">
                    <CheckIcon className="w-4 h-4" />{saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <XMarkIcon className="w-4 h-4" /> Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {saveMsg && <p className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{saveMsg}</p>}

          <div className="mt-5 space-y-4">
            {editing ? (
              <>
                <Field label="Titular profesional">
                  <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={120} className={input} placeholder="Ej: Ingeniero de Sistemas | React · Python" />
                </Field>
                <Field label="Resumen profesional">
                  <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} maxLength={1000} className={`${input} resize-none`} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono">
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
                  </Field>
                  <Field label="Modalidad">
                    <select value={form.workModality} onChange={(e) => setForm({ ...form, workModality: e.target.value })} className={select}>
                      {["Presencial", "Remoto", "Híbrido"].map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Promedio (0–20)">
                    <input type="number" min="0" max="20" step="0.1" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className={input} />
                  </Field>
                  <Field label="Disponibilidad">
                    <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={select}>
                      {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Salario esperado mín. (S/)">
                    <input type="number" value={form.salaryExpectation} onChange={(e) => setForm({ ...form, salaryExpectation: e.target.value })} className={input} />
                  </Field>
                  <Field label="Salario esperado máx. (S/)">
                    <input type="number" value={form.salaryExpectationMax} onChange={(e) => setForm({ ...form, salaryExpectationMax: e.target.value })} className={input} />
                  </Field>
                </div>
                <Field label="LinkedIn URL">
                  <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/tu-perfil" className={input} />
                </Field>
              </>
            ) : (
              <>
                {student.headline && <p className="text-base font-medium text-gray-800">{student.headline}</p>}
                {student.summary && <p className="text-sm text-gray-600 leading-relaxed">{student.summary}</p>}
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                  <span>📧 {student.user.email}</span>
                  {student.phone && <span>📱 {student.phone}</span>}
                  {student.workModality && <span>🏢 {student.workModality}</span>}
                  {student.availability && <span>⏱ {AVAILABILITY_LABELS[student.availability]}</span>}
                </div>
                {(student.salaryExpectation || student.gpa) && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    {student.gpa != null && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">Promedio: {student.gpa}/20</span>}
                    {student.salaryExpectation && (
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                        S/ {student.salaryExpectation.toLocaleString()}{student.salaryExpectationMax ? ` – ${student.salaryExpectationMax.toLocaleString()}` : ""}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Habilidades ── */}
        {student.skills.length > 0 && (
          <Section icon={<WrenchScrewdriverIcon className="w-5 h-5" />} title="Habilidades">
            <div className="flex flex-wrap gap-2">
              {student.skills.map((sk) => (
                <div key={sk.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                  <span className="font-medium text-gray-800">{sk.name}</span>
                  <span className="text-gray-400 ml-1.5">{"★".repeat(sk.level)}{"☆".repeat(5 - sk.level)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Experiencia ── */}
        {student.experience.length > 0 && (
          <Section icon={<BriefcaseIcon className="w-5 h-5" />} title="Experiencia laboral">
            <div className="space-y-4">
              {student.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-unsa-red/30 pl-4">
                  <div className="font-semibold text-gray-900 text-sm">{exp.position}</div>
                  <div className="text-sm text-unsa-red">{exp.company}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(exp.startDate).toLocaleDateString("es-PE", { month: "short", year: "numeric" })}
                    {" – "}
                    {exp.isCurrent ? "Actual" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("es-PE", { month: "short", year: "numeric" }) : ""}
                    {exp.salary && <span className="ml-2">· S/ {exp.salary.toLocaleString()}/mes</span>}
                  </div>
                  {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Formación complementaria ── */}
        <Section icon={<BookOpenIcon className="w-5 h-5" />} title="Formación complementaria"
          action={
            <button onClick={() => setShowCertForm((v) => !v)} className="flex items-center gap-1 text-xs text-unsa-red hover:underline">
              <PlusIcon className="w-3.5 h-3.5" />{showCertForm ? "Cancelar" : "Agregar"}
            </button>
          }
        >
          {showCertForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select value={certForm.tipo} onChange={(e) => setCertForm({ ...certForm, tipo: e.target.value })} className={select}>
                    {CERT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Nombre del programa">
                  <input value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} placeholder="Gestión de Proyectos" className={input} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Institución / Entidad">
                  <input value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} placeholder="PUCP, Cibertec, Coursera..." className={input} />
                </Field>
                <Field label="Fecha de obtención">
                  <input type="date" value={certForm.issueDate} onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })} className={input} />
                </Field>
              </div>
              <Field label="URL del certificado (opcional)">
                <input value={certForm.credentialUrl} onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })} placeholder="https://..." className={input} />
              </Field>
              <button onClick={handleAddCert} disabled={savingCert || !certForm.name || !certForm.issuer}
                className="text-sm bg-unsa-red text-white px-4 py-2 rounded-lg hover:bg-unsa-red-dark transition-colors disabled:opacity-50">
                {savingCert ? "Guardando..." : "Guardar formación"}
              </button>
            </div>
          )}

          {certs.length === 0 && !showCertForm ? (
            <p className="text-sm text-gray-400">Aún no has agregado cursos, diplomados ni seminarios.</p>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between gap-2 border-l-2 border-blue-200 pl-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cert.name}</p>
                    <p className="text-xs text-blue-600">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-xs text-gray-400">{new Date(cert.issueDate).toLocaleDateString("es-PE", { month: "long", year: "numeric" })}</p>
                    )}
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-unsa-red hover:underline">Ver certificado →</a>
                    )}
                  </div>
                  <button onClick={() => handleDeleteCert(cert.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Posgrado (solo egresados / titulados) ── */}
        {isGraduate && (
          <Section icon={<AcademicCapIcon className="w-5 h-5" />} title="Posgrado"
            badge={<span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Solo egresados</span>}
            action={
              <button onClick={() => setShowEduForm((v) => !v)} className="flex items-center gap-1 text-xs text-unsa-red hover:underline">
                <PlusIcon className="w-3.5 h-3.5" />{showEduForm ? "Cancelar" : "Agregar"}
              </button>
            }
          >
            {showEduForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo de posgrado">
                    <select value={eduForm.tipo} onChange={(e) => setEduForm({ ...eduForm, tipo: e.target.value })} className={select}>
                      {POSGRADO_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Especialidad / Mención">
                    <input value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} placeholder="Gestión Pública, Derecho Civil..." className={input} />
                  </Field>
                </div>
                <Field label="Universidad / Institución">
                  <input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="PUCP, UNSA, UPC..." className={input} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Año de inicio">
                    <input type="number" value={eduForm.startYear} onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })} placeholder="2023" className={input} />
                  </Field>
                  <Field label="Año de término">
                    <input type="number" value={eduForm.endYear} onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })} placeholder="2025" disabled={eduForm.isCurrent} className={`${input} disabled:opacity-50`} />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={eduForm.isCurrent} onChange={(e) => setEduForm({ ...eduForm, isCurrent: e.target.checked, endYear: "" })} className="rounded" />
                  En curso actualmente
                </label>
                <button onClick={handleAddEdu} disabled={savingEdu || !eduForm.field || !eduForm.institution || !eduForm.startYear}
                  className="text-sm bg-unsa-red text-white px-4 py-2 rounded-lg hover:bg-unsa-red-dark transition-colors disabled:opacity-50">
                  {savingEdu ? "Guardando..." : "Guardar posgrado"}
                </button>
              </div>
            )}

            {education.length === 0 && !showEduForm ? (
              <p className="text-sm text-gray-400">Aún no has registrado estudios de posgrado.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="flex items-start justify-between gap-2 border-l-2 border-purple-300 pl-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{edu.degree}{edu.field ? ` en ${edu.field}` : ""}</p>
                      <p className="text-xs text-purple-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400">
                        {edu.startYear} – {edu.isCurrent ? "En curso" : edu.endYear ?? ""}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteEdu(edu.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── Idiomas ── */}
        {student.languages.length > 0 && (
          <Section icon={<LanguageIcon className="w-5 h-5" />} title="Idiomas">
            <div className="flex flex-wrap gap-3">
              {student.languages.map((lang) => (
                <div key={lang.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                  <span className="font-medium text-gray-800">{lang.language}</span>
                  <span className="text-gray-500 ml-1.5">— {lang.level}</span>
                  {lang.certified && <span className="ml-1.5 text-green-600 text-xs">✓ Cert.</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Verificación ── */}
        <Section icon={<ShieldCheckIcon className="w-5 h-5" />} title="Estado de verificación">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${status.color}`}>
            {student.verificationStatus === "VERIFIED" ? <CheckIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
            {status.label}
          </div>
          <p className="text-xs text-gray-400 mt-2">La UDEEG verifica tu perfil para garantizar información auténtica a las empresas.</p>
        </Section>

        {/* ── Zona de peligro ── */}
        <div className="mt-2 border border-red-200 rounded-2xl p-5 bg-red-50/50">
          <h3 className="text-sm font-semibold text-red-700 mb-1">Zona de peligro</h3>
          <p className="text-xs text-gray-500 mb-4">Eliminar tu cuenta borra permanentemente tu perfil, historial y datos. Esta acción no se puede deshacer.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-600 border border-red-300 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
              <TrashIcon className="w-4 h-4" /> Eliminar mi cuenta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-700">¿Estás seguro? Esta acción es irreversible.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                  <TrashIcon className="w-4 h-4" />{deleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Helpers de estilos ──
const input = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red";
const select = `${input} bg-white`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Section({ icon, title, children, action, badge }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
  action?: React.ReactNode; badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-unsa-red">{icon}</span>
          <h2 className="font-semibold text-base">{title}</h2>
          {badge}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
