/**
 * auth.api.js — Servicios de comunicación para la autenticación.
 * 
 * Responsabilidad: Definir las funciones que llaman a los endpoints de /auth.
 * Siguiendo el spec (sección 6 y 8), las funciones retornan los datos de la respuesta.
 * No manejan errores de UI; eso se delega al componente que llama.
 */
import api from './axios';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};
