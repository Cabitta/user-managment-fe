/**
 * tests/components/PrivateRoute.test.jsx — Tests del guard de autenticación.
 * 
 * Responsabilidad: Verificar que el acceso a rutas protegidas se bloquee
 * si el usuario no tiene una sesión activa (token).
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../src/routes/PrivateRoute';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('PrivateRoute [Guard]', () => {

  const TestApp = () => (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/protected" element={<div>Contenido Protegido</div>} />
      </Route>
      <Route path="/login" element={<div>Pantalla de Login</div>} />
    </Routes>
  );

  it('Caso 1: debería permitir el acceso si hay un token en el store', () => {
    renderWithProviders(<TestApp />, { 
      initialStore: { token: 'valid-token' },
      route: '/protected'
    });

    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de Login')).not.toBeInTheDocument();
  });

  it('Caso 2: debería redirigir a /login si no hay token en el store', () => {
    renderWithProviders(<TestApp />, { 
      initialStore: { token: null },
      route: '/protected'
    });

    expect(screen.getByText('Pantalla de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

});
