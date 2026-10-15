import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";

function FriendHabits() {
  const { userId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [doneToday, setDoneToday] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const frequencyLabels = { DAILY: "Diário", WEEKLY: "Semanal", CUSTOM: "Personalizado" };

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/habits/user/${userId}`);
        setHabits(response.data);

        const statusMap = {};
        await Promise.all(
          response.data.map(async (habit) => {
            try {
              const logs = await api.get(`/habits/${habit.id}/logs`);
              const todayLog = logs.data.find((log) => log.date === today);
              statusMap[habit.id] = todayLog ? todayLog.completed : false;
            } catch {
              statusMap[habit.id] = false;
            }
          })
        );
        setDoneToday(statusMap);
      } catch (err) {
        setError(
          err.response?.status === 403
            ? "Você só pode ver os hábitos de pessoas que são suas amigas."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/friends")}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
          >
            Amigos
          </button>
          <h1 className="text-3xl font-bold">
            🪐 Hábitos de <span className="text-orange-500">{state?.name || "amigo"}</span>
          </h1>
          <span className="w-20" />
        </header>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {loading && <p className="text-zinc-400">Carregando...</p>}

        {!loading && !error && habits.length === 0 && (
          <p className="text-zinc-400">Essa pessoa ainda não tem hábitos públicos.</p>
        )}

        <ul className="space-y-3">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-lg">{habit.name}</strong>
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {frequencyLabels[habit.frequencyType]}
                  </span>
                </div>
                {habit.description && (
                  <p className="text-zinc-400 text-sm mt-1">{habit.description}</p>
                )}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  doneToday[habit.id] ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {doneToday[habit.id] ? "✅ Feito hoje" : "Ainda não hoje"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FriendHabits;