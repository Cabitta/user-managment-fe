/**
 * tests/helpers/renderWithProviders.jsx — Wrapper para tests de componentes.
 * 
 * Responsabilidad: Envolver el componente bajo test con todos los providers
 * necesarios (Router, Zustand, Theme) para que no falle al renderizar.
 * Permite inyectar un estado inicial del store para simular diferentes escenarios
 * (usuario logueado, sin sesión, admin, etc.).
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '../../src/store/authStore';

/**
 * Función helper que extiende el render de RTL.
 * @param {React.ReactElement} ui - El componente a renderizar.
 * @param {Object} options - Opciones de configuración (ruta, estado inicial del store).
 */
export const renderWithProviders = (
  ui, 
  { 
    initialStore = {}, 
    route = '/', 
    ...renderOptions 
  } = {}
) => {
  // Reiniciamos y preparamos el estado de Zustand antes del render
  // Esto asegura que cada test sea independiente.
  useAuthStore.setState({ 
    user: null, 
    token: null, 
    ...initialStore 
  });

  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </MemoryRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
