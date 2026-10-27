import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setDone(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError("Link inválido ou expirado. Peça um novo link.");
      } else if (status === 422) {
        setError("A senha precisa ter pelo menos 8 caracteres.");
      } else {
        setError("Não foi possível redefinir a senha agora. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Nova <span className="text-orange-500">senha</span>
        </h1>

        {!token ? (
          <div className="text-center">
            <p className="text-zinc-300">Link inválido. Peça um novo link de recuperação.</p>
            <Link to="/forgot-password" className="inline-block mt-6 text-orange-500 hover:underline">
              Pedir novo link
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <p className="text-emerald-400">Senha redefinida com sucesso!</p>
            <Link
              to="/login"
              className="inline-block mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-semibold transition"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                />
                <p className="text-xs text-zinc-500 mt-1">Mínimo de 8 caracteres.</p>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-black rounded-lg font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;