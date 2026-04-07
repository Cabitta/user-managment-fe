/**
 * tests/mocks/server.js — Instancia del servidor de MSW.
 * 
 * Responsabilidad: Crea e instancia el servidor de mocks para usar en Node.js
 * durante las corridas de tests de componentes con Vitest.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
