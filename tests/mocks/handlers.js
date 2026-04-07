/**
 * tests/mocks/handlers.js — Definición de interceptores para MSW.
 * 
 * Responsabilidad: Definir las respuestas que darán los endpoints de la API
 * durante los tests de componentes para evitar llamadas reales al backend.
 */
import { http, HttpResponse } from 'msw';
import { createAuthResponse, createUserData } from '../helpers/factories';

const API_URL = 'http://localhost:3000/api';

export const handlers = [
  // Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.clone().json();
    
    // Simulación de error (401 si mandamos email incorrecto)
    if (email === 'wrong@example.com') {
      return HttpResponse.json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' } 
      }, { status: 401 });
    }

    // Simulación de usuario inactivo (403)
    if (email === 'inactive@example.com') {
      return HttpResponse.json({ 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'Tu cuenta está inactiva. Contactá un administrador.' } 
      }, { status: 403 });
    }

    // Happy path (admin o user según el email)
    const isAdmin = email === 'admin@example.com';
    const userRole = isAdmin ? 'admin' : 'user';
    const user = createUserData({ email, role: userRole });
    
    return HttpResponse.json(createAuthResponse({ user }));
  }),

  // Register
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { email } = await request.clone().json();

    // Simulación de email duplicado (409)
    if (email === 'duplicate@example.com') {
      return HttpResponse.json({ 
        success: false, 
        error: { code: 'CONFLICT', message: 'El email ya está registrado.' } 
      }, { status: 409 });
    }

    // Happy path
    return HttpResponse.json({
      success: true,
      data: createUserData({ email }),
      message: 'Cuenta creada con éxito!'
    }, { status: 201 });
  }),

  // List Users
  http.get(`${API_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    
    // Generamos 15 usuarios para testear paginación (10 por página)
    const allUsers = Array.from({ length: 15 }, (_, i) => 
      createUserData({ 
        _id: `user-${i}`, 
        name: `Usuario ${i}`, 
        email: `user${i}@example.com`,
        role: i === 0 ? 'admin' : 'user', // El primero es admin
        createdAt: new Date().toISOString()
      })
    );

    // Filtrado simple por nombre si hay búsqueda
    const filteredUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase())
    );

    const limit = 10;
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  }),
];
