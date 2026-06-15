"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  StarIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { AppNavbar } from "@/components/AppNavbar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Candidate {
  id: string;
  name: string;
  career: string;
  gpa: number | null;
  skills: string[];
  experienceYears: number;
  salaryExpectation: number | null;
  matchScore: number;
  matchRank: number;
  explanation: string;
  availability: string;
  contact: { email: string; phone: string | null; linkedinUrl: string | null };
}

interface SearchResult {
  searchId: string;
  summary: string;
  totalFound: number;
  requirements: {
    careers: string[];
    skills: string[];
    experienceYears: number;
    salaryMin: number | null;
    salaryMax: number | null;
    workType: string;
  };
  candidates: Candidate[];
}

const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATE: "Disponible ahora",
  IN_30_DAYS: "En 30 días",
  IN_60_DAYS: "En 60 días",
  IN_90_DAYS: "En 90 días",
  INTERNSHIP_ONLY: "Solo prácticas",
  PART_TIME_ONLY: "Solo part-time",
};

export default function BuscarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy el asistente de la Bolsa de Trabajo UNSA. Para encontrar los mejores candidatos de la universidad, cuéntame:\n\n• ¿Qué puesto necesitas cubrir?\n• ¿Qué carrera o habilidades busca?\n• ¿Cuál es el rango salarial ofrecido?\n• ¿Modalidad de trabajo (presencial/remoto/híbrido)?\n\nPuedes escribir todo en lenguaje natural, yo me encargo del resto. 🎓",
    },
  ]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [readyToSearch, setReadyToSearch] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const companyId = (session?.user as { profileId?: string })?.profileId ?? "";

  const sendMessage = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLastQuery(input);
    setInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/matching", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          companyName: (session?.user as { name?: string })?.name,
        }),
      });
      const data = await res.json();

      const assistantMessage: Message = { role: "assistant", content: data.reply };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Auto-disparar búsqueda cuando el LLM indique que tiene suficiente info
      const reply = data.reply.toLowerCase();
      const readyPhrases = [
        "suficiente información para iniciar",
        "buscando candidatos ahora",
        "iniciar la búsqueda en la base de datos",
        "suficiente información",
        "iniciar la búsqueda",
        "comenzar la búsqueda",
        "buscar candidatos",
        "procedo a buscar",
        "realizaré la búsqueda",
        "tengo todo lo necesario",
        "puedo iniciar",
      ];
      if (readyPhrases.some((phrase) => reply.includes(phrase))) {
        // Auto-ejecutar la búsqueda con el historial actual
        performSearch(updatedMessages);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hubo un error. Por favor intenta de nuevo." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const performSearch = async (currentMessages?: Message[]) => {
    if (!companyId) return;
    setIsSearching(true);
    setReadyToSearch(false);

    const msgSource = currentMessages ?? messages;
    const fullQuery = msgSource
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(". ");

    try {
      const res = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: fullQuery, companyId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Hubo un error al buscar candidatos: ${data.error ?? "Error desconocido"}. Por favor intenta de nuevo.` },
        ]);
        return;
      }

      setSearchResult(data);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `¡Búsqueda completada! Encontré **${data.totalFound} candidatos verificados** que coinciden con tu perfil. Los resultados aparecen a la derecha. Los candidatos están rankeados por compatibilidad con tu puesto.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error al realizar la búsqueda. Verifica tu conexión." },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <AppNavbar />
      {/* ─── Main content ─── */}
      <div className="flex flex-1 overflow-hidden">
      {/* ─── Chat Panel ─── */}
      <div className="w-full md:w-[420px] flex flex-col border-r border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-unsa-red">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Buscar Candidatos</h1>
              <p className="text-xs text-red-200">IA UNSA · Powered by Groq Llama 3</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-unsa-red/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <SparklesIcon className="w-4 h-4 text-unsa-red" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-unsa-red text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-7 h-7 rounded-full bg-unsa-red/10 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-unsa-red" />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe el puesto que buscas..."
              rows={2}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-unsa-red/30 focus:border-unsa-red"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isChatLoading}
              className="bg-unsa-red text-white p-2.5 rounded-xl hover:bg-unsa-red-dark transition-colors disabled:opacity-40 self-end"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Ingresa rango salarial para activar la búsqueda
          </p>
        </div>
      </div>

      {/* ─── Results Panel ─── */}
      <div className="flex-1 overflow-y-auto">
        {!searchResult && !isSearching && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-unsa-red/10 flex items-center justify-center mb-4">
              <UserGroupIcon className="w-8 h-8 text-unsa-red" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Talento verificado de la UNSA
            </h2>
            <p className="text-gray-500 max-w-sm text-sm">
              Describe el puesto en el chat de la izquierda. La IA encontrará y rankeará
              los mejores candidatos de las 52 carreras de la UNSA.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: CheckBadgeIcon, label: "Perfiles verificados" },
                { icon: StarIcon, label: "Ranking por IA" },
                { icon: BriefcaseIcon, label: "Contacto directo" },
              ].map((f) => (
                <div key={f.label} className="bg-white border border-gray-100 rounded-xl p-4">
                  <f.icon className="w-6 h-6 text-unsa-red mx-auto mb-2" />
                  <span className="text-xs text-gray-600">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearching && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-unsa-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analizando perfiles con IA...</p>
              <p className="text-sm text-gray-400 mt-1">Esto toma unos segundos</p>
            </div>
          </div>
        )}

        {searchResult && (
          <div className="p-6">
            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">
                    {searchResult.totalFound} candidato{searchResult.totalFound !== 1 ? "s" : ""} encontrado{searchResult.totalFound !== 1 ? "s" : ""}
                  </h2>
                  <p className="text-sm text-gray-500">{searchResult.summary}</p>
                </div>
                <div className="bg-unsa-red/10 text-unsa-red text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                  Búsqueda #{searchResult.searchId.slice(-6)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {searchResult.requirements.careers.map((c) => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    {c}
                  </span>
                ))}
                {searchResult.requirements.skills.slice(0, 5).map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                    {s}
                  </span>
                ))}
                {searchResult.requirements.salaryMin && (
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                    S/ {searchResult.requirements.salaryMin.toLocaleString()} – {searchResult.requirements.salaryMax?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-4">
              {searchResult.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-unsa-red to-unsa-red-dark text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {candidate.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.career}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${scoreColor(candidate.matchScore)}`}>
                          <StarIcon className="w-3.5 h-3.5" />
                          {Math.round(candidate.matchScore)}%
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {candidate.explanation}
                      </p>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                        {candidate.gpa && (
                          <span>Promedio: <strong className="text-gray-800">{candidate.gpa}/20</strong></span>
                        )}
                        {candidate.experienceYears > 0 && (
                          <span>Exp: <strong className="text-gray-800">{candidate.experienceYears.toFixed(1)} años</strong></span>
                        )}
                        {candidate.salaryExpectation && (
                          <span>Expectativa: <strong className="text-gray-800">S/ {candidate.salaryExpectation.toLocaleString()}</strong></span>
                        )}
                        <span className="text-green-600 font-medium">
                          {AVAILABILITY_LABELS[candidate.availability]}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {candidate.skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 6 && (
                          <span className="text-xs text-gray-400">+{candidate.skills.length - 6} más</span>
                        )}
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                        <a
                          href={`mailto:${candidate.contact.email}`}
                          className="text-xs bg-unsa-red text-white px-3 py-1.5 rounded-lg hover:bg-unsa-red-dark transition-colors"
                        >
                          Contactar
                        </a>
                        {candidate.contact.linkedinUrl && (
                          <a
                            href={candidate.contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                        {candidate.contact.phone && (
                          <span className="text-xs text-gray-500">{candidate.contact.phone}</span>
                        )}
                        <span className="ml-auto text-xs text-gray-400">
                          #{candidate.matchRank} en ranking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
