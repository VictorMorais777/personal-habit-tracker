import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { todayLocal } from "../services/date";
import { describeGoal } from "../services/goal";

function aiErrorMessage(err) {
  const status = err.response?.status;
  if (status === 429) return "Você usou todas as consultas de IA de hoje. Volte amanhã.";
  if (status === 400) return "Crie pelo menos um hábito antes de pedir o resumo.";
  return "A IA não conseguiu responder agora. Tente novamente em instantes.";
}

function Assistant() {
  const navigate = useNavigate();
  const [quota, setQuota] = useState(null);
  const [focus, setFocus] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [added, setAdded] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(null); // "suggestions" | "summary" | null
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/ai/quota")
      .then((response) => setQuota(response.data))
      .catch(() => {});
  }, []);

  function updateRemaining(remaining) {
    setQuota((current) => ({ ...current, remaining }));
  }

  async function handleSuggest() {
    setError(null);
    setMessage(null);
    setAdded([]);
    setLoading("suggestions");
    try {
      const response = await api.post("/ai/suggestions", { focus });
      setSuggestions(response.data.suggestions);
      updateRemaining(response.data.remaining);
    } catch (err) {
      if (err.response?.status === 429) updateRemaining(0);
      setError(aiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleSummary() {
    setError(null);
    setMessage(null);
    setLoading("summary");
    try {
      const response = await api.post("/ai/summary", { today: todayLocal() });
      setSummary(response.data.summary);
      updateRemaining(response.data.remaining);
    } catch (err) {
      if (err.response?.status === 429) updateRemaining(0);
      setError(aiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleAdd(suggestion, index) {
    setError(null);
    setMessage(null);
    try {
      await api.post("/habits", {
        name: suggestion.name,
        description: suggestion.description,
        isPublic: false,
        frequencyType: suggestion.frequencyType,
        timesPerWeek: suggestion.timesPerWeek,
        weekDays: suggestion.weekDays,
      });
      setAdded((current) => [...current, index]);
      setMessage(`"${suggestion.name}" foi adicionado aos seus hábitos.`);
    } catch {
      setError("Não foi possível adicionar esse hábito agora.");
    }
  }

  const busy = loading !== null;
  const noQuota = quota !== null && quota.remaining === 0;
  const cardClass = "bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="glass-bar sticky top-4 z-40 flex items-center justify-between gap-2 px-4 py-3 mb-8">
          <button
            onClick={() => navigate("/habits")}
            className="px-4 py-2 rounded-lg glass transition text-sm"
          >
            Meus Hábitos
          </button>
          <h1 className="text-3xl font-bold">
            🪐 <span className="text-orange-500">Assistente</span>
          </h1>
          <span className="text-xs text-zinc-400 w-28 text-right">
            {quota ? `${quota.remaining} de ${quota.limit} usos hoje` : ""}
          </span>
        </header>

        <p className="text-xs text-zinc-500 mb-6">
          Ao usar o assistente, seus hábitos (nomes, descrições e números de progresso) e sua meta
          principal são enviados à Google (Gemini) para gerar a resposta. No plano gratuito da API, a
          Google pode usar esse conteúdo para melhorar seus produtos. Seu nome, email e senha nunca são
          enviados.
        </p>

        {message && <p className="text-emerald-400 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <section className={cardClass}>
          <h2 className="text-lg font-semibold mb-1">Sugestões de novos hábitos</h2>
          <p className="text-sm text-zinc-400 mb-4">
            A IA sugere hábitos diferentes dos que você já tem, com base na sua meta principal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              maxLength={150}
              placeholder="Foco opcional (ex.: dormir melhor, estudar mais)"
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
            />
            <button
              onClick={handleSuggest}
              disabled={busy || noQuota}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-black rounded-lg font-semibold transition"
            >
              {loading === "suggestions" ? "Pensando..." : "Sugerir hábitos"}
            </button>
          </div>

          <ul className="space-y-3 mt-5">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.name}-${index}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{suggestion.name}</strong>
                    <span className="text-xs px-2 py-1 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-300">
                      {describeGoal(suggestion)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{suggestion.description}</p>
                </div>
                <button
                  onClick={() => handleAdd(suggestion, index)}
                  disabled={added.includes(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    added.includes(index)
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default"
                      : "bg-orange-500 hover:bg-orange-400 text-black"
                  }`}
                >
                  {added.includes(index) ? "✅ Adicionado" : "Adicionar"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold mb-1">Resumo da semana</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Um balanço dos seus últimos 7 dias, com conquistas, um ponto de atenção e uma sugestão.
          </p>
          <button
            onClick={handleSummary}
            disabled={busy || noQuota}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-black rounded-lg font-semibold transition"
          >
            {loading === "summary" ? "Pensando..." : "Gerar resumo"}
          </button>

          {summary && (
            <p className="mt-5 text-zinc-300 leading-relaxed whitespace-pre-line">{summary}</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Assistant;