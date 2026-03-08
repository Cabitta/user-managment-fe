/**
 * api/users.api.js — Servicios de gestión de usuarios (Admin).
 * 
 * Basado en Spec 3.2.
 */
import api from './axios';

/**
 * Obtener listado de usuarios con filtros y paginación.
 * @param {Object} params - { page, limit, role, search }
 */
export const getUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

/**
 * Obtener un usuario por ID.
 */
export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

/**
 * Actualizar un usuario (Admin).
 */
export const updateUserAdmin = async (id, userData) => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

/**
 * Borrado lógico (soft-delete) de un usuario.
 */
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
