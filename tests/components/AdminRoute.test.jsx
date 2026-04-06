/**
 * tests/components/AdminRoute.test.jsx — Tests del guard de administrador.
 * 
 * Responsabilidad: Verificar que solo usuarios con rol 'admin' puedan
 * acceder a las rutas de gestión de usuarios.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import AdminRoute from '../../src/routes/AdminRoute';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { createAdminData, createUserData } from '../helpers/factories';

describe('AdminRoute [Guard]', () => {

  const TestApp = () => (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route path="/admin-only" element={<div>Contenido Admin</div>} />
      </Route>
      <Route path="/profile" element={<div>Mi Perfil (User)</div>} />
    </Routes>
  );

  it('Caso 3: debería permitir el acceso si el usuario tiene rol "admin"', () => {
    const adminUser = createAdminData();
    renderWithProviders(<TestApp />, { 
      initialStore: { user: adminUser, token: 'fake-token' },
      route: '/admin-only'
    });

    expect(screen.getByText('Contenido Admin')).toBeInTheDocument();
    expect(screen.queryByText('Mi Perfil (User)')).not.toBeInTheDocument();
  });

  it('Caso 4: debería redirigir a /profile si el usuario tiene rol "user"', () => {
    const commonUser = createUserData();
    renderWithProviders(<TestApp />, { 
      initialStore: { user: commonUser, token: 'fake-token' },
      route: '/admin-only'
    });

    expect(screen.getByText('Mi Perfil (User)')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Admin')).not.toBeInTheDocument();
  });

});
