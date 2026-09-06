import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { connectSocket, disconnectSocket } from "../api/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("spark_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("spark_user");
    return raw ? JSON.parse(raw) : null;
  });

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem("spark_token", nextToken);
    localStorage.setItem("spark_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    connectSocket(nextToken);
  }, []);

  const register = useCallback(
    async (username, password) => {
      const { data } = await apiClient.post("/auth/register", { username, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const login = useCallback(
    async (username, password) => {
      const { data } = await apiClient.post("/auth/login", { username, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("spark_token");
    localStorage.removeItem("spark_user");
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), register, login, logout }),
    [token, user, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
