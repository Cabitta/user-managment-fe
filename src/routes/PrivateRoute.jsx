/**
 * PrivateRoute.jsx — Guard para rutas protegidas.
 *
 * Responsabilidad: Solo permite el acceso si el usuario está autenticado.
 * Si no hay token, redirige a /login.
 * Siguiendo el spec (sección 7).
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PrivateRoute() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
