/**
 * AdminRoute.jsx — Guard para rutas de administrador.
 *
 * Responsabilidad: Solo permite el acceso si el usuario tiene rol 'admin'.
 * Si está logueado pero no es admin, redirige a /profile (spec 7).
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
