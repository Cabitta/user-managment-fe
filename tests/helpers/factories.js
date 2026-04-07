/**
 * tests/helpers/factories.js — Funciones para generar datos de prueba.
 * 
 * Responsabilidad: Proveer objetos de datos consistentes para los tests,
 * evitando hardcodear datos en cada archivo de test.
 */

/**
 * Crea un objeto de usuario estándar (rol: user).
 */
export const createUserData = (overrides = {}) => ({
  _id: 'user-123',
  name: 'Ana García',
  email: 'ana@example.com',
  role: 'user',
  ...overrides,
});

/**
 * Crea un objeto de usuario administrador.
 */
export const createAdminData = (overrides = {}) => ({
  _id: 'admin-456',
  name: 'Pedro Admin',
  email: 'admin@example.com',
  role: 'admin',
  ...overrides,
});

/**
 * Simula la respuesta completa de un login exitoso.
 */
export const createAuthResponse = (overrides = {}) => ({
  success: true,
  data: createUserData(overrides.user || overrides.data || {}),
  token: 'fake-jwt-token',
  ...overrides,
});

/**
 * Simula una respuesta paginada de la lista de usuarios.
 */
export const createPaginatedResponse = (users = [], overrides = {}) => ({
  success: true,
  data: users,
  pagination: {
    total: users.length,
    page: 1,
    limit: 10,
    pages: 1,
    ...overrides.pagination,
  },
  ...overrides,
});
