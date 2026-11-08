import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId, logout } from "../services/auth";
import { squareJpegBlob } from "../services/image";
import Avatar from "../components/Avatar";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

function photoErrorMessage(err) {
  const status = err.response?.status;
  if (status === 413) return "A foto é grande demais.";
  if (status === 415 || status === 400) return "Esse formato de imagem não é aceito. Use JPG ou PNG.";
  return "Não foi possível atualizar a foto agora. Tente novamente.";
}

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
  const [photoVersion, setPhotoVersion] = useState(null);
  const [uploading, setUploading] = useState(false);
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
      setPhotoVersion(user.photoVersion || null);
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

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo outra vez
    if (!file) return;

    setMessage(null);
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("A imagem é grande demais (máximo de 10 MB).");
      return;
    }

    setUploading(true);
    try {
      const blob = await squareJpegBlob(file);
      const data = new FormData();
      data.append("file", blob, "avatar.jpg");
      const response = await api.post("/users/me/photo", data);
      setPhotoVersion(response.data.photoVersion);
      setMessage("Foto atualizada!");
    } catch (err) {
      setError(err.response ? photoErrorMessage(err) : "Não foi possível ler essa imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setMessage(null);
    setError(null);
    setUploading(true);
    try {
      await api.delete("/users/me/photo");
      setPhotoVersion(null);
      setMessage("Foto removida.");
    } catch {
      setError("Não foi possível remover a foto agora.");
    } finally {
      setUploading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="glass-bar sticky top-4 z-40 flex items-center justify-between gap-2 px-4 py-3 mb-8">
          <h1 className="text-3xl font-bold">
            🪐 Meu <span className="text-orange-500">Perfil</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/habits")}
              className="px-4 py-2 rounded-lg glass transition text-sm"
            >
              Meus Hábitos
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg glass transition text-sm"
            >
              Sair
            </button>
          </div>
        </header>

        {userName && (
          <p className="text-zinc-400 mb-6">
            Logado como <span className="text-(--ink) font-semibold">{userName}</span>
          </p>
        )}

        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <Avatar
            userId={userId}
            name={userName}
            photoVersion={photoVersion}
            size="w-24 h-24"
            textSize="text-3xl"
          />
          <div>
            <p className="font-semibold">Foto de perfil</p>
            <p className="text-xs text-zinc-500 mb-3">
              JPG ou PNG. A foto é recortada em formato quadrado.
            </p>
            <div className="flex items-center gap-4">
              <label
                className={`px-4 py-2 rounded-lg glass transition text-sm ${
                  uploading ? "opacity-60 cursor-wait" : "cursor-pointer"
                }`}
              >
                {uploading ? "Enviando..." : photoVersion ? "Trocar foto" : "Escolher foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {photoVersion && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="text-xs text-zinc-400 hover:text-red-400 transition"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className={`${inputClass} resize-none`}
              placeholder="Conte um pouco sobre você"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Localidade (opcional)</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputClass}
              placeholder="Cidade, País"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Meta principal</label>
            <input
              name="mainGoal"
              value={form.mainGoal}
              onChange={handleChange}
              className={inputClass}
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
                  className={inputClass}
                  placeholder="https://instagram.com/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Twitter / X</label>
                <input
                  name="twitterUrl"
                  value={form.twitterUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://x.com/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">LinkedIn</label>
                <input
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/seuusuario"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">GitHub</label>
                <input
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  className={inputClass}
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