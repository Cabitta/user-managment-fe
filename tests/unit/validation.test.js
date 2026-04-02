/**
 * tests/unit/validation.test.js — Tests de funciones de validación.
 * 
 * Responsabilidad: Verificar que las funciones puras en src/lib/validations.js
 * se comporten exactamente como define el spec (sección 6).
 */
import { describe, it, expect } from 'vitest';
import { 
  validatePassword, 
  validatePasswordMatch, 
  validateEmail,
  validateName 
} from '../../src/lib/validations';

describe('Funciones de Validación', () => {

  describe('validatePassword()', () => {
    it('Caso 1: debería ser válido con contraseña robusta (Password123)', () => {
      expect(validatePassword('Password123')).toBe(true);
    });

    it('Caso 2: debería ser válido con 8 caracteres exactos (Password1)', () => {
      // Usamos Password1 que tiene exactamente 9 caracteres en realidad...
      // Vamos a usar uno de 8 para cumplir con el comentario del spec
      expect(validatePassword('Passwor1')).toBe(true);
    });

    it('Caso 3: debería fallar si es menor a 8 caracteres (short1A)', () => {
      expect(validatePassword('short1A')).toBe('Mínimo 8 caracteres');
    });

    it('Caso 4: debería fallar si no tiene mayúscula (password123)', () => {
      expect(validatePassword('password123')).toBe('Debe tener al menos una mayúscula');
    });

    it('Caso 5: debería fallar si no tiene minúscula (PASSWORD123)', () => {
      expect(validatePassword('PASSWORD123')).toBe('Debe tener al menos una minúscula');
    });

    it('Caso 6: debería fallar si no tiene número (PasswordSinNum)', () => {
      expect(validatePassword('PasswordSinNum')).toBe('Debe tener al menos un número');
    });

    it('Caso 7: debería fallar si está vacío', () => {
      expect(validatePassword('')).toBe('La contraseña es requerida');
    });
  });

  describe('validatePasswordMatch()', () => {
    it('Caso 8: debería ser válido si ambas coinciden (Password123)', () => {
      expect(validatePasswordMatch('Password123', 'Password123')).toBe(true);
    });

    it('Caso 9: debería fallar si no coinciden', () => {
      expect(validatePasswordMatch('Password123', 'Password456')).toBe('Las contraseñas no coinciden');
    });

    it('Caso 10: debería fallar si el segundo campo está vacío', () => {
      expect(validatePasswordMatch('Password123', '')).toBe('Debés confirmar la contraseña');
    });
  });

  describe('validateEmail()', () => {
    it('Caso 11: debería ser válido con formato correcto (ana@example.com)', () => {
      expect(validateEmail('ana@example.com')).toBe(true);
    });

    it('Caso 12: debería fallar con formato inválido (ana@)', () => {
      expect(validateEmail('ana@')).toBe('Email inválido');
    });

    it('Caso 13: debería fallar si está vacío', () => {
      expect(validateEmail('')).toBe('El email es requerido');
    });
  });

  describe('validateName()', () => {
    it('Caso 14: debería ser válido con nombre normal (Ana García)', () => {
      expect(validateName('Ana García')).toBe(true);
    });

    it('Caso 15: debería ser válido con 2 caracteres exactos (Al)', () => {
      expect(validateName('Al')).toBe(true);
    });

    it('Caso 16: debería fallar con menos de 2 caracteres (A)', () => {
      expect(validateName('A')).toBe('Mínimo 2 caracteres');
    });

    it('Caso 17: debería fallar con más de 50 caracteres', () => {
      expect(validateName('a'.repeat(51))).toBe('Máximo 50 caracteres');
    });

    it('Caso 18: debería fallar si está vacío', () => {
      expect(validateName('')).toBe('El nombre es requerido');
    });
  });

});
