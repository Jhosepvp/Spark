import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../api/socket";
import { SparkiMascot } from "../components/SparkiMascot";

const MODES = [
  { key: "1on1", label: "Chat 1 a 1", event: "matchmaking:join_1on1" },
  { key: "global", label: "Chat global", event: "global:join" },
];

export function WaitingRoomPage() {
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleMatched({ roomId }) {
      setSearching(false);
      navigate(`/chat/${encodeURIComponent(roomId)}`);
    }

    socket.on("matchmaking:matched", handleMatched);
    return () => socket.off("matchmaking:matched", handleMatched);
  }, [navigate]);

  function startSearch(selected) {
    const socket = getSocket();
    if (!socket) return;

    setMode(selected.key);

    if (selected.key === "global") {
      socket.emit(selected.event);
      navigate("/chat/global-chat");
      return;
    }

    setSearching(true);
    socket.emit(selected.event);
  }

  function cancelSearch() {
    getSocket()?.emit("matchmaking:leave_1on1");
    setSearching(false);
    setMode(null);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <SparkiMascot className={`h-32 w-32 ${searching ? "animate-pulse" : ""}`} />

      <div className="text-center">
        <h2 className="text-lg font-medium text-text">
          {searching ? "Sparki está buscando a alguien..." : "¿Con quién quieres hablar hoy?"}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {searching ? "Esto puede tardar unos segundos." : "Elige un modo para empezar."}
        </p>
      </div>

      {!searching ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => startSearch(m)}
              className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text transition hover:border-accent"
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={cancelSearch}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition hover:text-text"
        >
          Cancelar búsqueda
        </button>
      )}
    </div>
  );
}
