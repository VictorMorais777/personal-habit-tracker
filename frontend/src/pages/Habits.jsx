import { useState, useEffect } from "react";
import api from "../services/api";

function Habits() {
  const [userId, setUserId] = useState("");
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    frequencyType: "DAILY",
  });
  const [error, setError] = useState(null);

  async function loadHabits(id) {
    if (!id) return;
    try {
      const response = await api.get(`/habits/user/${id}`);
      setHabits(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadHabits(userId);
  }, [userId]);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    if (!userId) {
      setError("Informe um User ID primeiro");
      return;
    }

    try {
      await api.post("/habits", {
        ...form,
        user: { id: Number(userId) },
      });
      setForm({ name: "", description: "", frequencyType: "DAILY" });
      loadHabits(userId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div>
      <h1>Meus Hábitos</h1>

      <div>
        <label>User ID (temporário, até termos login)</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Ex: 1"
        />
      </div>

      <h2>Criar novo hábito</h2>
      <form onSubmit={handleCreateHabit}>
        <div>
          <label>Nome</label>
          <input name="name" value={form.name} onChange={handleFormChange} required />
        </div>
        <div>
          <label>Descrição</label>
          <input name="description" value={form.description} onChange={handleFormChange} />
        </div>
        <div>
          <label>Frequência</label>
          <select name="frequencyType" value={form.frequencyType} onChange={handleFormChange}>
            <option value="DAILY">Diário</option>
            <option value="WEEKLY">Semanal</option>
            <option value="CUSTOM">Personalizado</option>
          </select>
        </div>
        <button type="submit">Criar hábito</button>
      </form>

      {error && <p style={{ color: "red" }}>Erro: {error}</p>}

      <h2>Lista de hábitos</h2>
      {habits.length === 0 && <p>Nenhum hábito cadastrado ainda.</p>}
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            <strong>{habit.name}</strong> — {habit.frequencyType}
            {habit.description && <p>{habit.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Habits;