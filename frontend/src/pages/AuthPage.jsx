import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SparkiMascot } from "../components/SparkiMascot";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate("/waiting-room");
    } catch (err) {
      setError(err.response?.data?.error ?? "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-bg px-6">
      <div className="flex flex-col items-center gap-3">
        <SparkiMascot className="h-24 w-24" animated={false} />
        <h1 className="text-xl font-semibold tracking-tight text-text">spark</h1>
        <p className="text-center text-sm text-text-muted">
          Conversaciones anónimas, sin presión.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          autoComplete="username"
          required
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Contraseña"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-muted disabled:opacity-50"
        >
          {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-sm text-text-muted transition hover:text-text"
      >
        {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
