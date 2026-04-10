import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({ user: null, token: null });
  });

  it('debería inicializar con user y token nulos', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('debería actualizar user y token al llamar a setSession', () => {
    const mockUser = { id: 1, name: 'Test' };
    const mockToken = 'fake-token';

    useAuthStore.getState().setSession(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
  });

  it('debería limpiar el estado al llamar a clearSession', () => {
    // Set initial state
    useAuthStore.setState({ user: { id: 1 }, token: 'token' });

    // Call logout
    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('debería actualizar los datos del usuario parcialmente al llamar a updateUser', () => {
    useAuthStore.setState({ user: { id: 1, name: 'Viejo', role: 'user' }, token: 't' });
    useAuthStore.getState().updateUser({ name: 'Nuevo' });
    const state = useAuthStore.getState();
    expect(state.user).toEqual({ id: 1, name: 'Nuevo', role: 'user' });
  });
});
