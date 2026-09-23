import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/users")
      .then((response) => setUsers(response.data))
      .then(() => console.log("Conectado com sucesso!"))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Habit Tracker</h1>
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
      <p>Usuários cadastrados: {users.length}</p>
    </div>
  );
}

export default App;