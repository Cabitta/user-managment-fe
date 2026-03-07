/**
 * App.jsx — Definición de rutas y navegación.
 *
 * Responsabilidad: Orquestar el enrutamiento de la aplicación usando React Router.
 * Define la estructura de rutas protegidas y públicas según el spec (sección 3 y 7).
 *
 * Estructura:
 * /login     → Solo si no está logueado (PublicOnlyRoute)
 * /profile   → Si está logueado (PrivateRoute)
 * /users...  → Si es admin (AdminRoute + PrivateRoute)
 * /          → Redirección inteligente
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Páginas
import AuthPage from "./pages/AuthPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Guards
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

// Componente para el path "/" (Spec 3, Sección 47)
function RootRedirect() {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  return user?.role === "admin" ? (
    <Navigate to="/users" replace />
  ) : (
    <Navigate to="/profile" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal con redirect inteligente */}
        <Route path="/" element={<RootRedirect />} />

        {/* Rutas Públicas (solo accesibles si NO estás logueado) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
        </Route>

        {/* Rutas Privadas (requieren autenticación) */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfilePage />} />

          {/* Rutas de Administrador */}
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
          </Route>
        </Route>

        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
