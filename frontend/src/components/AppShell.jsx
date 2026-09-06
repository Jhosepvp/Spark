import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/waiting-room", label: "Emparejar" },
  { to: "/friends", label: "Amigos" },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-bg text-text">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-medium tracking-wide text-text-muted">
          spark
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm text-text-faint transition hover:text-text"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="flex border-t border-border">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm transition ${
                isActive ? "text-accent" : "text-text-faint hover:text-text-muted"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
