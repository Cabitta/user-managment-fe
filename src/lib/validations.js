/**
 * src/lib/validations.js — Funciones de validación de formularios.
 * 
 * Responsabilidad: Centralizar la lógica de validación para que sea
 * testeable de forma aislada y reutilizable en toda la app.
 * Siguiendo el spec de testing (sección 6).
 */

/**
 * Valida un email según formato estándar.
 */
export const validateEmail = (email) => {
  if (!email) return "El email es requerido";
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email) || "Email inválido";
};

/**
 * Valida una contraseña según requisitos de seguridad:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
export const validatePassword = (password) => {
  if (!password) return "La contraseña es requerida";
  if (password.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Debe tener al menos una mayúscula";
  if (!/[a-z]/.test(password)) return "Debe tener al menos una minúscula";
  if (!/[0-9]/.test(password)) return "Debe tener al menos un número";
  return true;
};

/**
 * Valida un nombre de usuario (2-50 caracteres).
 */
export const validateName = (name) => {
  if (!name) return "El nombre es requerido";
  if (name.length < 2) return "Mínimo 2 caracteres";
  if (name.length > 50) return "Máximo 50 caracteres";
  return true;
};

/**
 * Valida que dos contraseñas coincidan (password match).
 */
export const validatePasswordMatch = (password, confirm) => {
  if (!confirm) return "Debés confirmar la contraseña";
  return password === confirm || "Las contraseñas no coinciden";
};
