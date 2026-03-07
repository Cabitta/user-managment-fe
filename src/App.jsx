/**
 * App.jsx — Componente raíz de la aplicación.
 *
 * Responsabilidad: En esta Fase 2 funciona como verificación del setup.
 * Muestra un ThemeToggle simple para confirmar que Tailwind dark mode
 * y next-themes funcionan correctamente antes de agregar el router.
 * En la Fase 3 este archivo será reemplazado por la definición de rutas.
 */
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
    >
      {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Administrador de Usuarios</h1>
      <p className="text-muted-foreground">Fase 2 — Setup completado ✅</p>
      <ThemeToggle />
    </div>
  );
}

export default App;
