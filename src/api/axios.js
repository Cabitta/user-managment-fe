/**
 * api/axios.js — Cliente HTTP configurado.
 *
 * Responsabilidad: Centralizar las peticiones a la API.
 * - Usa la URL base definida en .env.
 * - Request Interceptor: Agrega el header Authorization si hay un token.
 * - Response Interceptor: Maneja errores 401 para limpiar la sesión y redirigir.
 * Siguiendo el spec (sección 6 y 8) y SKILL (regla 11).
 */
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de Request: envía el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: detecta token expirado o inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor devuelve 401, el token ya no es válido
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      // Redirección manual si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
