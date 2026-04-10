import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../src/api/axios';
import { getMe, updateMe, logout, deleteMe } from '../../src/api/auth.api';
import { getUserById, updateUserAdmin } from '../../src/api/users.api';

// Mockeamos la instancia de axios para no hacer llamadas reales
vi.mock('../../src/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth.api', () => {
    it('getMe llama a GET /auth/me', async () => {
      api.get.mockResolvedValueOnce({ data: { id: 1 } });
      const result = await getMe();
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual({ id: 1 });
    });

    it('updateMe llama a PUT /auth/me', async () => {
      api.put.mockResolvedValueOnce({ data: { success: true } });
      const result = await updateMe({ name: 'Nuevo' });
      expect(api.put).toHaveBeenCalledWith('/auth/me', { name: 'Nuevo' });
      expect(result).toEqual({ success: true });
    });

    it('logout llama a POST /auth/logout', async () => {
      api.post.mockResolvedValueOnce({ data: { success: true } });
      const result = await logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ success: true });
    });

    it('deleteMe llama a DELETE /auth/me', async () => {
      api.delete.mockResolvedValueOnce({ data: { success: true } });
      const result = await deleteMe();
      expect(api.delete).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual({ success: true });
    });
  });

  describe('users.api', () => {
    it('getUserById llama a GET /users/:id', async () => {
      api.get.mockResolvedValueOnce({ data: { id: 'u1' } });
      const result = await getUserById('u1');
      expect(api.get).toHaveBeenCalledWith('/users/u1');
      expect(result).toEqual({ id: 'u1' });
    });

    it('updateUserAdmin llama a PUT /users/:id', async () => {
      api.put.mockResolvedValueOnce({ data: { success: true } });
      const result = await updateUserAdmin('u1', { role: 'admin' });
      expect(api.put).toHaveBeenCalledWith('/users/u1', { role: 'admin' });
      expect(result).toEqual({ success: true });
    });
  });
});
