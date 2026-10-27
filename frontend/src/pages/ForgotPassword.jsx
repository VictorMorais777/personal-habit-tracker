import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Não foi possível enviar o pedido agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Recuperar <span className="text-orange-500">senha</span>
        </h1>

        {sent ? (
          <div className="text-center">
            <p className="text-zinc-300 mt-4">
              Se esse email estiver cadastrado, enviamos um link para redefinir a senha.
              O link vale por 30 minutos.
            </p>
            <Link to="/login" className="inline-block mt-6 text-orange-500 hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-6 text-center">
              Digite o email da sua conta e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-black rounded-lg font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

            <p className="text-sm text-zinc-400 mt-6 text-center">
              Lembrou a senha?{" "}
              <Link to="/login" className="text-orange-500 hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;