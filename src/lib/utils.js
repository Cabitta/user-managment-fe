/**
 * lib/utils.js — Función utilitaria compartida por los componentes de shadcn/ui.
 *
 * Responsabilidad: Combinar clases de Tailwind de forma segura, resolviendo
 * conflictos entre clases (ej: "p-2" y "p-4" → gana la última, no se acumulan).
 * Todos los componentes de shadcn/ui importan esta función.
 */
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
