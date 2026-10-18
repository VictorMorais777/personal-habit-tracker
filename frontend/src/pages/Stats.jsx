import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { todayLocal, addDays, formatShort } from "../services/date";

const WEEKS = 8;
const STRIP_DAYS = 30;

function DayStrip({ dates, today }) {
  const done = new Set(dates);
  const days = Array.from({ length: STRIP_DAYS }, (_, i) =>
    addDays(today, -(STRIP_DAYS - 1 - i))
  );

  return (
    <div className="flex flex-wrap gap-1 mt-3">
      {days.map((day) => (
        <div
          key={day}
          title={formatShort(day)}
          className={`w-3.5 h-3.5 rounded-sm ${
            done.has(day)
              ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]"
              : "bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-3xl font-bold text-orange-500 mt-1">{value}</p>
      {detail && <p className="text-xs text-zinc-500 mt-1">{detail}</p>}
    </div>
  );
}

function Stats() {
  const navigate = useNavigate();
  const today = todayLocal();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/habits/stats", { params: { today } });
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [today]);

  const allDates = stats.flatMap((habit) => habit.recentDates);

  const weeklyData = Array.from({ length: WEEKS }, (_, i) => {
    const blockIndex = WEEKS - 1 - i;
    const end = addDays(today, -7 * blockIndex);
    const start = addDays(end, -6);
    const checkins = allDates.filter((d) => d >= start && d <= end).length;
    return { label: formatShort(start), checkins };
  });

  const bestHabit = stats.reduce(
    (best, habit) =>
      habit.currentStreak > (best ? best.currentStreak : 0) ? habit : best,
    null
  );
  const last7Start = addDays(today, -6);
  const checkinsLast7 = allDates.filter((d) => d >= last7Start).length;
  const totalCheckins = stats.reduce((sum, habit) => sum + habit.totalCompleted, 0);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/habits")}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
          >
            Meus Hábitos
          </button>
          <h1 className="text-3xl font-bold">
            🪐 <span className="text-orange-500">Progresso</span>
          </h1>
          <span className="w-28" />
        </header>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {loading && <p className="text-zinc-400">Carregando...</p>}

        {!loading && !error && stats.length === 0 && (
          <p className="text-zinc-400">
            Crie seu primeiro hábito para começar a acompanhar o progresso.
          </p>
        )}

        {!loading && stats.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <SummaryCard
                label="Maior sequência atual"
                value={bestHabit ? `${bestHabit.currentStreak} 🔥` : "—"}
                detail={bestHabit ? bestHabit.name : "Marque um hábito hoje"}
              />
              <SummaryCard label="Check-ins nos últimos 7 dias" value={checkinsLast7} />
              <SummaryCard label="Check-ins no total" value={totalCheckins} />
            </div>

            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-1">Check-ins por semana</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Últimas {WEEKS} semanas, todos os hábitos somados
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid stroke="#27272a" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: 8,
                      }}
                      cursor={{ fill: "rgba(249,115,22,0.1)" }}
                      formatter={(value) => [value, "Check-ins"]}
                      labelFormatter={(label) => `Semana de ${label}`}
                    />
                    <Bar dataKey="checkins" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <h2 className="text-lg font-semibold mb-4">Por hábito</h2>
            <ul className="space-y-3">
              {stats.map((habit) => (
                <li
                  key={habit.habitId}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-lg">{habit.name}</strong>
                    <div className="flex gap-4 text-sm whitespace-nowrap">
                      <span className="text-orange-400">
                        🔥 {habit.currentStreak} {habit.currentStreak === 1 ? "dia" : "dias"}
                      </span>
                      <span className="text-zinc-400">Recorde: {habit.longestStreak}</span>
                    </div>
                  </div>
                  <DayStrip dates={habit.recentDates} today={today} />
                  <p className="text-xs text-zinc-500 mt-2">Últimos {STRIP_DAYS} dias</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;