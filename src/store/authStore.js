/**
 * store/authStore.js — Gestión del estado global de autenticación.
 *
 * Responsabilidad: Guardar el usuario y el token JWT.
 * Implementa persistencia automática en localStorage usando el middleware 'persist'.
 * Siguiendo el spec (sección 5), solo se guardan los campos básicos del usuario.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Acción para iniciar sesión (se llama desde AuthPage)
      setSession: (user, token) => set({ user, token }),

      // Acción para cerrar sesión (logout)
      clearSession: () => set({ user: null, token: null }),

      // Acción para actualizar datos del usuario después de editar perfil
      updateUser: (user) => set((state) => ({ 
        user: { ...state.user, ...user } 
      })),
    }),
    {
      name: 'auth-storage', // clave para el localStorage
    }
  )
);
