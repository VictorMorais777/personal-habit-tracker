import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId, logout } from "../services/auth";

function Profile() {
  const userId = getUserId();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: "",
    location: "",
    mainGoal: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get(`/users/${userId}`);
      const user = response.data;
      setUserName(user.name);
      setForm({
        bio: user.bio || "",
        location: user.location || "",
        mainGoal: user.mainGoal || "",
        instagramUrl: user.instagramUrl || "",
        twitterUrl: user.twitterUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await api.put(`/users/${userId}/profile`, form);
      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            🪐 Meu <span className="text-orange-500">Perfil</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/habits")}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
            >
              Meus Hábitos
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm"
            >
              Sair
            </button>
          </div>
        </header>

        {userName && (
          <p className="text-zinc-400 mb-6">
            Logado como <span className="text-white font-semibold">{userName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition resize-none"
              placeholder="Conte um pouco sobre você"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Localidade (opcional)</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
              placeholder="Cidade, País"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Meta principal</label>
            <input
              name="mainGoal"
              value={form.mainGoal}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
              placeholder="Ex: Ler 24 livros em 2026"
            />
          </div>

          <div className="border-t border-zinc-800 pt-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Redes sociais</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Instagram</label>
                <input
                  name="instagramUrl"
                  value={form.instagramUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="https://instagram.com/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Twitter / X</label>
                <input
                  name="twitterUrl"
                  value={form.twitterUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="https://x.com/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">LinkedIn</label>
                <input
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="https://linkedin.com/in/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">GitHub</label>
                <input
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="https://github.com/seuusuario"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            Salvar alterações
          </button>
        </form>

        {message && <p className="text-emerald-400 text-sm mt-4 text-center">{message}</p>}
        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default Profile;