import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId, logout } from "../services/auth";

function Habits() {
  const userId = getUserId();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    frequencyType: "DAILY",
  });
  const [error, setError] = useState(null);
  const [checkedToday, setCheckedToday] = useState({});

  const today = new Date().toISOString().split("T")[0];

  async function loadHabits() {
    try {
      const response = await api.get(`/habits/user/${userId}`);
      setHabits(response.data);
      setError(null);
      loadTodayStatus(response.data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadTodayStatus(habitList) {
    const statusMap = {};
    await Promise.all(
      habitList.map(async (habit) => {
        try {
          const response = await api.get(`/habits/${habit.id}/logs`);
          const logs = response.data;
          const todayLog = logs.find((log) => log.date === today);
          statusMap[habit.id] = todayLog ? todayLog.completed : false;
        } catch {
          statusMap[habit.id] = false;
        }
      })
    );
    setCheckedToday(statusMap);
  }

  useEffect(() => {
    loadHabits();
  }, []);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    try {
      await api.post("/habits", { ...form, user: { id: Number(userId) } });
      setForm({ name: "", description: "", frequencyType: "DAILY" });
      loadHabits();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleCheckIn(habitId) {
    try {
      await api.post(`/habits/${habitId}/logs`, { date: today, completed: true });
      setCheckedToday({ ...checkedToday, [habitId]: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const frequencyLabels = { DAILY: "Diário", WEEKLY: "Semanal", CUSTOM: "Personalizado" };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
            >
              Meu Perfil
            </button>
          <h1 className="text-3xl font-bold">
            🪐 Meus <span className="text-orange-500">Hábitos</span>
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
          >
            Sair
          </button>
        </header>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Criar novo hábito</h2>
          <form onSubmit={handleCreateHabit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Nome</label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
              <input
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Frequência</label>
              <select
                name="frequencyType"
                value={form.frequencyType}
                onChange={handleFormChange}
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
              >
                <option value="DAILY">Diário</option>
                <option value="WEEKLY">Semanal</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                Criar hábito
              </button>
            </div>
          </form>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <h2 className="text-lg font-semibold mb-4">Lista de hábitos</h2>
        {habits.length === 0 && (
          <p className="text-zinc-400">Nenhum hábito cadastrado ainda.</p>
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

              <button
                onClick={() => handleCheckIn(habit.id)}
                disabled={checkedToday[habit.id]}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  checkedToday[habit.id]
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default"
                    : "bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.25)]"
                }`}
              >
                {checkedToday[habit.id] ? "✅ Feito hoje" : "Marcar como feito"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Habits;