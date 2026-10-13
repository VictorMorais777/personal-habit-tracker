import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";

function describeError(err) {
  const status = err.response?.status;
  if (status === 409) return "Você já tem um pedido ou uma amizade com essa pessoa.";
  if (status === 400) return "Ação inválida.";
  if (status === 403) return "Você não tem permissão para fazer isso.";
  return err.message;
}

function SocialLinks({ user }) {
  const links = [
    ["Instagram", user.instagramUrl],
    ["X", user.twitterUrl],
    ["LinkedIn", user.linkedinUrl],
    ["GitHub", user.githubUrl],
  ].filter(([, url]) => url && /^https?:\/\//i.test(url));

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-2 text-xs">
      {links.map(([label, url]) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline"
        >
          {label}
        </a>
      ))}
    </div>
  );
}

function PersonInfo({ user }) {
  return (
    <div>
      <strong className="text-lg">{user.name}</strong>
      {user.location && <span className="text-xs text-zinc-500 ml-2">{user.location}</span>}
      {user.mainGoal && <p className="text-sm text-orange-400 mt-1">🎯 {user.mainGoal}</p>}
      {user.bio && <p className="text-zinc-400 text-sm mt-1">{user.bio}</p>}
      <SocialLinks user={user} />
    </div>
  );
}

function Friends() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [sentIds, setSentIds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function loadFriends() {
    try {
      const response = await api.get("/friends");
      setFriends(response.data);
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function loadRequests() {
    try {
      const response = await api.get("/friends/requests");
      setRequests(response.data);
    } catch (err) {
      setError(describeError(err));
    }
  }

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await api.get("/users/search", { params: { q: query } });
      setResults(response.data);
      setSearched(true);
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleSendRequest(userId) {
    setError(null);
    setMessage(null);
    try {
      await api.post(`/friends/requests/${userId}`);
      setSentIds([...sentIds, userId]);
      setMessage("Pedido de amizade enviado!");
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleAccept(friendshipId) {
    setError(null);
    try {
      await api.put(`/friends/requests/${friendshipId}/accept`);
      loadRequests();
      loadFriends();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleRemove(friendshipId, askConfirmation) {
    if (askConfirmation && !window.confirm("Desfazer essa amizade?")) return;
    setError(null);
    try {
      await api.delete(`/friends/${friendshipId}`);
      loadRequests();
      loadFriends();
    } catch (err) {
      setError(describeError(err));
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const buttonClass =
    "px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-sm";
  const cardClass = "bg-zinc-950 border border-zinc-800 rounded-xl p-4";

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/habits")} className={buttonClass}>
            Meus Hábitos
          </button>
          <h1 className="text-3xl font-bold">
            🪐 <span className="text-orange-500">Amigos</span>
          </h1>
          <button onClick={handleLogout} className={buttonClass}>
            Sair
          </button>
        </header>

        {message && <p className="text-emerald-400 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Buscar pessoas</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite pelo menos 2 letras do nome"
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-orange-500 transition"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-semibold transition"
            >
              Buscar
            </button>
          </form>

          {searched && results.length === 0 && (
            <p className="text-zinc-400 text-sm mt-4">Nenhuma pessoa encontrada.</p>
          )}

          <ul className="space-y-3 mt-4">
            {results.map((user) => (
              <li key={user.id} className={`${cardClass} flex items-start justify-between gap-4`}>
                <PersonInfo user={user} />
                <button
                  onClick={() => handleSendRequest(user.id)}
                  disabled={sentIds.includes(user.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    sentIds.includes(user.id)
                      ? "bg-zinc-900 text-zinc-400 border border-zinc-700 cursor-default"
                      : "bg-orange-500 hover:bg-orange-400 text-black"
                  }`}
                >
                  {sentIds.includes(user.id) ? "Pedido enviado" : "Adicionar"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pedidos recebidos</h2>
          {requests.length === 0 && (
            <p className="text-zinc-400 text-sm">Nenhum pedido pendente.</p>
          )}
          <ul className="space-y-3">
            {requests.map((request) => (
              <li key={request.id} className={`${cardClass} flex items-start justify-between gap-4`}>
                <PersonInfo user={request.user} />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-400 text-black transition"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleRemove(request.id, false)}
                    className="px-4 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Meus amigos</h2>
          {friends.length === 0 && (
            <p className="text-zinc-400 text-sm">Você ainda não tem amigos adicionados.</p>
          )}
          <ul className="space-y-3">
            {friends.map((friendship) => (
              <li key={friendship.id} className={`${cardClass} flex items-start justify-between gap-4`}>
                <PersonInfo user={friendship.user} />
                <button
                  onClick={() => handleRemove(friendship.id, true)}
                  className="text-xs text-zinc-400 hover:text-red-400 transition whitespace-nowrap"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Friends;