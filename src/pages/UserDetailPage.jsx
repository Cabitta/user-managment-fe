/**
 * UserDetailPage.jsx — Detalle de usuario.
 *
 * Responsabilidad: Ver, editar y eliminar un usuario específico.
 * Accesible solo para el rol 'admin' (spec 4.3).
 */
import { useParams } from "react-router-dom";

export default function UserDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Detalle de Usuario</h1>
      <p className="text-muted-foreground">
        ID del usuario: {id} (Placeholder)
      </p>
    </div>
  );
}
