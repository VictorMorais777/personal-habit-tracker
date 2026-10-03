import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuth } from "../services/auth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post("/auth/login", form);
      saveAuth(response.data);
      navigate("/habits");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou senha inválidos");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Entrar no <span className="text-orange-500">Saturn</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            Entrar
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

        <p className="text-sm text-zinc-400 mt-6 text-center">
          Não tem conta?{" "}
          <Link to="/register" className="text-orange-500 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;