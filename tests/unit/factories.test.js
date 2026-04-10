import { describe, it, expect } from 'vitest';
import { createUserData, createAdminData, createAuthResponse, createPaginatedResponse } from '../helpers/factories';

describe('Factories Helpers', () => {
  it('createUserData genera datos por defecto', () => {
    expect(createUserData()).toEqual({
      _id: 'user-123',
      name: 'Ana García',
      email: 'ana@example.com',
      role: 'user',
    });
  });

  it('createAdminData genera datos de admin por defecto', () => {
    expect(createAdminData()).toEqual({
      _id: 'admin-456',
      name: 'Pedro Admin',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  it('createAuthResponse permite overrides anidados', () => {
    const res1 = createAuthResponse({ user: { name: 'Override Name' } });
    expect(res1.data.name).toBe('Override Name');

    const res2 = createAuthResponse({ data: { role: 'admin' } });
    expect(res2.data.role).toBe('admin');
  });

  it('createPaginatedResponse genera la estructura esperada', () => {
    const res = createPaginatedResponse([{ id: 1 }], { pagination: { page: 2, totalPages: 2 } });
    expect(res).toEqual({
      success: true,
      data: [{ id: 1 }],
      pagination: {
        total: 1,
        page: 2,
        limit: 10,
        pages: 1,
        totalPages: 2
      }
    });
  });
});
