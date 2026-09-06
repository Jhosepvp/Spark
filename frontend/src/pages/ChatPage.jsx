import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

export function ChatPage() {
  const { roomId } = useParams();
  const isGlobal = roomId === "global-chat";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const eventName = isGlobal ? "global:message" : "room:message";

    function handleMessage(payload) {
      if (!isGlobal && payload.roomId !== roomId) return;
      setMessages((prev) => [...prev, payload]);
    }

    socket.on(eventName, handleMessage);
    return () => socket.off(eventName, handleMessage);
  }, [roomId, isGlobal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const socket = getSocket();
    if (isGlobal) {
      socket?.emit("global:message", { text });
    } else {
      socket?.emit("room:message", { roomId, text });
    }
    setDraft("");
  }

  function leaveChat() {
    if (!isGlobal) {
      getSocket()?.emit("multichat:leave", { roomId });
    }
    navigate("/waiting-room");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm text-text-muted">
          {isGlobal ? "Chat global" : "Chat anónimo"}
        </span>
        <button
          onClick={leaveChat}
          className="text-sm text-text-faint transition hover:text-danger"
        >
          Salir del chat
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-text-faint">
            Aún no hay mensajes. Di algo.
          </p>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.username === user?.username;
          return (
            <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isOwn
                    ? "bg-accent text-white"
                    : "bg-surface text-text border border-border"
                }`}
              >
                {isGlobal && !isOwn && (
                  <p className="mb-0.5 text-xs text-text-faint">{msg.username}</p>
                )}
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-muted"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
