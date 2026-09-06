import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { WaitingRoomPage } from "./pages/WaitingRoomPage";
import { ChatPage } from "./pages/ChatPage";
import { FriendsPage } from "./pages/FriendsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/waiting-room" element={<WaitingRoomPage />} />
          <Route path="/friends" element={<FriendsPage />} />
        </Route>
        <Route path="/chat/:roomId" element={<ChatPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
