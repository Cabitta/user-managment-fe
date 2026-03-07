/**
 * ProfilePage.jsx — Perfil del usuario autenticado.
 *
 * Responsabilidad: Ver y editar el perfil propio.
 * Usa los endpoints /api/auth/me (spec 4.4).
 */
export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <p className="text-muted-foreground">
        Datos del usuario logueado (Placeholder)
      </p>
    </div>
  );
}
