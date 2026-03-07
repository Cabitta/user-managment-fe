/**
 * PublicOnlyRoute.jsx — Guard para rutas de acceso público exclusivo.
 *
 * Responsabilidad: Redirige al home (/) si el usuario ya está logueado.
 * Se usa para /login para evitar que un usuario autenticado vuelva a loguearse.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PublicOnlyRoute() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
