import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">
          🪐 Saturn <span className="text-orange-500">Habit Tracker</span>
        </h1>
        <nav className="flex gap-4">
          <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-zinc-900 transition">
            Entrar
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold transition shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Construa <span className="text-orange-500">hábitos melhores</span>, um dia de cada vez
        </h2>
        <p className="text-lg text-zinc-400 mb-12">
          O Saturn Habit Tracker ajuda você a acompanhar seus hábitos diários,
          semanais ou personalizados, visualizar seu progresso e manter a
          consistência ao longo do tempo.
        </p>

        <section className="text-left bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold mb-4">Como funciona</h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex gap-3">
              <span className="text-orange-500">✓</span> Cadastre os hábitos que quer construir
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">✓</span> Marque check-ins diários conforme cumpre cada um
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">✓</span> Acompanhe gráficos e estatísticas de progresso
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">✓</span> Receba sugestões inteligentes baseadas nos seus hábitos
            </li>
          </ul>
        </section>

        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-xl font-semibold transition shadow-[0_0_25px_rgba(249,115,22,0.5)]"
        >
          Começar agora
        </Link>
      </main>
    </div>
  );
}

export default LandingPage;