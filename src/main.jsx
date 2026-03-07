/**
 * main.jsx — Entry point de la aplicación.
 *
 * Responsabilidad: Montar el árbol de componentes React en el DOM.
 * Envuelve la app con ThemeProvider (next-themes) para que el toggle
 * claro/oscuro esté disponible en toda la aplicación.
 * El atributo "class" en ThemeProvider es requerido por Tailwind darkMode: ["class"].
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
