/**
 * NotFoundPage.jsx — Página 404.
 *
 * Responsabilidad: Mostrar un mensaje cuando la ruta no existe.
 */
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl">Página no encontrada</p>
      <Link to="/" className="text-primary hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
