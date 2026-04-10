/**
 * tests/components/PublicOnlyRoute.test.jsx — Tests del guard de acceso exclusivo público.
 * 
 * Responsabilidad: Verificar que el acceso a rutas como /login se permita
 * solo a usuarios NO autenticados. Si hay sesión, debe redirigir a /.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import PublicOnlyRoute from '../../src/routes/PublicOnlyRoute';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('PublicOnlyRoute [Guard]', () => {

  const TestApp = () => (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<div>Formulario de Login</div>} />
      </Route>
      <Route path="/" element={<div>Home Page (Protegida/Privada)</div>} />
    </Routes>
  );

  it('Caso 1: debería permitir el acceso (renderizar Outlet) si no hay token en el store', () => {
    renderWithProviders(<TestApp />, { 
      initialStore: { token: null },
      route: '/login'
    });

    // Se muestra la ruta hija (el login)
    expect(screen.getByText('Formulario de Login')).toBeInTheDocument();
    expect(screen.queryByText('Home Page (Protegida/Privada)')).not.toBeInTheDocument();
  });

  it('Caso 2: debería redirigir a / si hay un token activo', () => {
    renderWithProviders(<TestApp />, { 
      initialStore: { token: 'valid-token' },
      route: '/login'
    });

    // En vez del login, se muestra la redirección (Home, /)
    expect(screen.getByText('Home Page (Protegida/Privada)')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de Login')).not.toBeInTheDocument();
  });

});
