import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div>
      <header>
        <h1>Saturn Habit Tracker</h1>
        <nav>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Criar conta</Link>
        </nav>
      </header>

      <main>
        <h2>Construa hábitos melhores, um dia de cada vez</h2>
        <p>
          O Saturn Habit Tracker ajuda você a acompanhar seus hábitos diários,
          semanais ou personalizados, visualizar seu progresso e manter a
          consistência ao longo do tempo.
        </p>

        <section>
          <h3>Como funciona</h3>
          <ul>
            <li>Cadastre os hábitos que quer construir</li>
            <li>Marque check-ins diários conforme cumpre cada um</li>
            <li>Acompanhe gráficos e estatísticas de progresso</li>
            <li>Receba sugestões inteligentes baseadas nos seus hábitos</li>
          </ul>
        </section>

        <Link to="/register">
          <button>Começar agora</button>
        </Link>
      </main>
    </div>
  );
}

export default LandingPage;