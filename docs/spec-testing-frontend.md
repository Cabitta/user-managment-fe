# Spec — Testing: Frontend

**Versión:** 1.0
**Fecha:** 2026-03-31
**Metodología:** Spec-Driven Development (SDD)
**Repositorio:** `user-management-client`
**Referencia:** `docs/spec-frontend.md`

---

## 1. Descripción

Este documento define la estrategia de testing del frontend. Cubre los tests unitarios de funciones de validación, los tests de componentes de las páginas y guards de rutas, y los tests E2E de los flujos críticos de la aplicación.

**Principio general:** cada test verifica una sola cosa. Un test que falla debe indicar exactamente qué rompió, sin ambigüedad.

---

## 2. Stack de Testing

| Herramienta               | Propósito                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| Vitest                    | Framework de testing: correr tests, assertions, mocks            |
| React Testing Library     | Renderizar y testear componentes React de forma accesible        |
| @testing-library/user-event | Simular interacciones reales del usuario (clicks, tipeo, etc.) |
| jsdom                     | Simular el DOM del navegador en Node.js                          |
| Playwright                | Tests E2E: controlar un navegador real para flujos completos     |
| msw (Mock Service Worker) | Interceptar y mockear llamadas a la API en tests de componentes  |

---

## 3. Estructura de Carpetas

```
user-management-client/
├── src/
├── tests/
│   ├── unit/
│   │   └── validation.test.js      # Tests de funciones de validación de formularios
│   ├── components/
│   │   ├── AuthPage.test.jsx
│   │   ├── PrivateRoute.test.jsx
│   │   ├── AdminRoute.test.jsx
│   │   └── UsersPage.test.jsx
│   ├── e2e/
│   │   ├── auth.spec.js            # Flujos de login y registro
│   │   ├── profile.spec.js         # Flujos de perfil propio
│   │   └── users.spec.js           # Flujos de gestión de usuarios
│   └── helpers/
│       ├── renderWithProviders.jsx  # Wrapper con Router y store para tests de componentes
│       └── factories.js            # Datos de prueba consistentes
├── vitest.config.js
├── playwright.config.js
└── .env.test
```

---

## 4. Configuración

### Variables de entorno para testing

Archivo `.env.test`:

```
NODE_ENV=test
VITE_API_URL=http://localhost:3000/api
```

Para los tests E2E el backend debe estar corriendo en `localhost:3000` con su propia base de datos de testing.

### Umbral mínimo de cobertura (Vitest)

Los tests unitarios y de componentes deben mantener un mínimo de **80%** en todas las métricas. Si el coverage cae por debajo, Vitest falla el build.

```javascript
// vitest.config.js
coverage: {
  thresholds: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  }
}
```

### Carpetas excluidas del coverage

No se mide coverage de:

- `src/components/ui/` — componentes de shadcn/ui, no son código propio
- `src/main.jsx` — entry point
- `src/index.css` — estilos globales
- `playwright.config.js` — configuración de E2E

---

## 5. Helpers

### `tests/helpers/renderWithProviders.jsx`

Wrapper que envuelve el componente bajo test con todos los providers necesarios: React Router (con `MemoryRouter`), Zustand store, y ThemeProvider. Sin este wrapper los componentes que usan `useNavigate`, `useAuthStore` o `useTheme` fallan al renderizar.

```jsx
// Uso en tests
render(<AuthPage />, { wrapper: renderWithProviders })
```

Acepta un parámetro opcional `initialStore` para precargar el estado de Zustand con un usuario logueado o sin sesión según lo que necesite el test.

### `tests/helpers/factories.js`

Funciones que crean datos de prueba consistentes:

- `createUserData(overrides)` — objeto con datos de un usuario por defecto, acepta overrides
- `createAdminData(overrides)` — igual pero con `role: 'admin'`
- `createAuthResponse(overrides)` — objeto que simula la respuesta de `POST /api/auth/login`
- `createPaginatedResponse(users, overrides)` — objeto que simula la respuesta de `GET /api/users`

---

## 6. Tests Unitarios — Validaciones

Las funciones de validación de formularios se testean de forma **completamente aislada**, sin renderizar ningún componente. Son funciones puras que reciben un valor y devuelven `true` o un mensaje de error.

**Archivo:** `tests/unit/validation.test.js`

### `validatePassword(password)`

| Caso | Tipo     | Input              | Resultado esperado                          |
| ---- | -------- | ------------------ | ------------------------------------------- |
| 1    | ✅ Happy | `"Password123"`    | `true`                                      |
| 2    | ❌ Sad   | `"short1A"`        | `true` (8 chars exactos, válido)            |
| 3    | ❌ Sad   | `"short1"`         | Mensaje: mínimo 8 caracteres                |
| 4    | ❌ Sad   | `"password123"`    | Mensaje: debe tener al menos una mayúscula  |
| 5    | ❌ Sad   | `"PASSWORD123"`    | Mensaje: debe tener al menos una minúscula  |
| 6    | ❌ Sad   | `"PasswordSinNum"` | Mensaje: debe tener al menos un número      |
| 7    | ❌ Sad   | `""`               | Mensaje: campo requerido                    |

### `validatePasswordMatch(password, confirm)`

| Caso | Tipo     | Input                             | Resultado esperado         |
| ---- | -------- | --------------------------------- | -------------------------- |
| 8    | ✅ Happy | `"Password123"`, `"Password123"`  | `true`                     |
| 9    | ❌ Sad   | `"Password123"`, `"Password456"`  | Mensaje: las contraseñas no coinciden |
| 10   | ❌ Sad   | `"Password123"`, `""`             | Mensaje: campo requerido   |

### `validateEmail(email)`

| Caso | Tipo     | Input              | Resultado esperado          |
| ---- | -------- | ------------------ | --------------------------- |
| 11   | ✅ Happy | `"ana@example.com"`| `true`                      |
| 12   | ❌ Sad   | `"ana@"`           | Mensaje: email inválido     |
| 13   | ❌ Sad   | `""`               | Mensaje: campo requerido    |

### `validateName(name)`

| Caso | Tipo     | Input               | Resultado esperado          |
| ---- | -------- | ------------------- | --------------------------- |
| 14   | ✅ Happy | `"Ana García"`      | `true`                      |
| 15   | ✅ Happy | `"Al"`              | `true` (2 chars mín.)       |
| 16   | ❌ Sad   | `"A"`               | Mensaje: mínimo 2 caracteres|
| 17   | ❌ Sad   | `"a".repeat(51)`    | Mensaje: máximo 50 caracteres|
| 18   | ❌ Sad   | `""`                | Mensaje: campo requerido    |

---

## 7. Tests de Componentes

Los componentes se testean renderizándolos en un DOM simulado (jsdom). Las llamadas a la API se interceptan con **msw** para que los tests no dependan del backend real. Cada test verifica el comportamiento visible para el usuario: qué se renderiza, qué pasa al hacer click, qué mensaje aparece ante un error.

### 7.1 PrivateRoute

**Archivo:** `tests/components/PrivateRoute.test.jsx`

| Caso | Tipo     | Estado del store       | Resultado esperado                  |
| ---- | -------- | ---------------------- | ----------------------------------- |
| 1    | ✅ Happy | Usuario logueado       | Renderiza el componente hijo        |
| 2    | ❌ Sad   | Sin sesión (null)      | Redirige a `/login`                 |

### 7.2 AdminRoute

**Archivo:** `tests/components/AdminRoute.test.jsx`

| Caso | Tipo     | Estado del store            | Resultado esperado              |
| ---- | -------- | --------------------------- | ------------------------------- |
| 3    | ✅ Happy | Usuario con `role: 'admin'` | Renderiza el componente hijo    |
| 4    | ❌ Sad   | Usuario con `role: 'user'`  | Redirige a `/profile`           |

### 7.3 AuthPage

**Archivo:** `tests/components/AuthPage.test.jsx`

#### Modo Login

| Caso | Tipo     | Acción / Input                        | Resultado esperado                                        |
| ---- | -------- | ------------------------------------- | --------------------------------------------------------- |
| 5    | ✅ Happy | Submit con credenciales válidas       | Llama a `POST /api/auth/login`, guarda sesión en store    |
| 6    | ✅ Happy | Login admin exitoso                   | Redirige a `/users`                                       |
| 7    | ✅ Happy | Login user exitoso                    | Redirige a `/profile`                                     |
| 8    | ❌ Sad   | Submit con email vacío                | Muestra error debajo del campo email                      |
| 9    | ❌ Sad   | Submit con email inválido             | Muestra error debajo del campo email                      |
| 10   | ❌ Sad   | Submit con password vacía             | Muestra error debajo del campo password                   |
| 11   | ❌ Sad   | API devuelve 401                      | Muestra mensaje de error general encima del botón         |
| 12   | ❌ Sad   | API devuelve 403 (usuario inactivo)   | Muestra mensaje de error general encima del botón         |

#### Modo Registro

| Caso | Tipo     | Acción / Input                          | Resultado esperado                                     |
| ---- | -------- | --------------------------------------- | ------------------------------------------------------ |
| 13   | ✅ Happy | Submit con datos válidos                | Llama a `POST /api/auth/register`, luego hace login    |
| 14   | ✅ Happy | Registro exitoso                        | Redirige según rol                                     |
| 15   | ❌ Sad   | Password sin mayúscula                  | Muestra error debajo del campo password                |
| 16   | ❌ Sad   | Password sin número                     | Muestra error debajo del campo password                |
| 17   | ❌ Sad   | Password menor a 8 caracteres           | Muestra error debajo del campo password                |
| 18   | ❌ Sad   | Confirmar password no coincide          | Muestra error debajo del campo confirmar password      |
| 19   | ❌ Sad   | API devuelve 409 (email duplicado)      | Muestra `error.message` de la API encima del botón     |

#### Comportamiento compartido

| Caso | Tipo     | Acción                        | Resultado esperado                           |
| ---- | -------- | ----------------------------- | -------------------------------------------- |
| 20   | ✅ Happy | Click en toggle Login/Registro | Cambia el modo y resetea el formulario       |
| 21   | ✅ Happy | Usuario ya logueado visita `/login` | Redirige automáticamente                |

### 7.4 UsersPage

**Archivo:** `tests/components/UsersPage.test.jsx`

| Caso | Tipo     | Acción / Input                    | Resultado esperado                                    |
| ---- | -------- | --------------------------------- | ----------------------------------------------------- |
| 22   | ✅ Happy | Carga inicial                     | Llama a `GET /api/users?page=1&limit=10`, muestra tabla |
| 23   | ✅ Happy | Escribe en buscador               | Llama a API con `?search=<término>` tras debounce     |
| 24   | ✅ Happy | Cambia de página                  | Llama a API con `?page=N` manteniendo `search` activo |
| 25   | ✅ Happy | Limpia el buscador                | Vuelve a llamar sin `?search`, desde página 1         |
| 26   | ❌ Sad   | API devuelve lista vacía          | Muestra mensaje "No se encontraron usuarios"          |
| 27   | ❌ Sad   | API devuelve error 500            | Muestra mensaje de error en la pantalla               |

---

## 8. Tests E2E — Flujos críticos

Los tests E2E usan Playwright con un navegador real (Chromium). Requieren el backend corriendo en `localhost:3000` y el frontend en `localhost:5173`. No se mockea nada: la app se comporta exactamente como en producción.

Se testean solo los flujos más críticos. Los casos borde ya están cubiertos en los tests de componentes.

### 8.1 Auth flows

**Archivo:** `tests/e2e/auth.spec.js`

| Caso | Tipo     | Flujo                                           | Resultado esperado                          |
| ---- | -------- | ----------------------------------------------- | ------------------------------------------- |
| 1    | ✅ Happy | Login como admin                                | Redirige a `/users`, navbar muestra nombre  |
| 2    | ✅ Happy | Login como user                                 | Redirige a `/profile`                       |
| 3    | ✅ Happy | Registro de nuevo usuario                       | Login automático y redirige a `/profile`    |
| 4    | ✅ Happy | Logout desde ProfilePage                        | Redirige a `/login`, sesión limpia          |
| 5    | ❌ Sad   | Login con credenciales incorrectas              | Muestra mensaje de error en el formulario   |
| 6    | ❌ Sad   | Acceso a `/users` sin autenticar                | Redirige a `/login`                         |
| 7    | ❌ Sad   | Acceso a `/users` como user (no admin)          | Redirige a `/profile`                       |

### 8.2 Profile flows

**Archivo:** `tests/e2e/profile.spec.js`

| Caso | Tipo     | Flujo                                           | Resultado esperado                          |
| ---- | -------- | ----------------------------------------------- | ------------------------------------------- |
| 8    | ✅ Happy | Ver perfil propio                               | Muestra datos del usuario logueado          |
| 9    | ✅ Happy | Editar nombre desde ProfilePage                 | Nombre actualizado visible en modo Vista    |
| 10   | ✅ Happy | Cancelar edición                                | Vuelve a modo Vista sin cambios             |
| 11   | ❌ Sad   | Intentar guardar nombre vacío                   | Muestra error de validación local           |

### 8.3 Users flows (solo admin)

**Archivo:** `tests/e2e/users.spec.js`

| Caso | Tipo     | Flujo                                           | Resultado esperado                               |
| ---- | -------- | ----------------------------------------------- | ------------------------------------------------ |
| 12   | ✅ Happy | Listar usuarios como admin                      | Tabla visible con paginación                     |
| 13   | ✅ Happy | Buscar usuario por nombre                       | Tabla filtra resultados correctamente            |
| 14   | ✅ Happy | Navegar al detalle de un usuario                | Muestra datos del usuario                        |
| 15   | ✅ Happy | Editar nombre de un usuario                     | Nombre actualizado visible en modo Vista         |
| 16   | ✅ Happy | Eliminar usuario (soft-delete)                  | Redirige a `/users`, usuario ya no aparece       |
| 17   | ❌ Sad   | Intentar eliminar sin confirmar el modal        | Modal se cierra, usuario no se elimina           |

---

## 9. Resumen de casos de test

| Suite              | Tests unitarios | Tests de componentes | Tests E2E | Total  |
| ------------------ | --------------- | -------------------- | --------- | ------ |
| Validaciones       | 18              | —                    | —         | 18     |
| PrivateRoute       | —               | 2                    | —         | 2      |
| AdminRoute         | —               | 2                    | —         | 2      |
| AuthPage           | —               | 17                   | —         | 17     |
| UsersPage          | —               | 6                    | —         | 6      |
| Auth E2E           | —               | —                    | 7         | 7      |
| Profile E2E        | —               | —                    | 4         | 4      |
| Users E2E          | —               | —                    | 6         | 6      |
| **Total**          | **13**          | **27**               | **17**    | **57** |

---

## 10. Scripts

```json
"scripts": {
  "test": "vitest",
  "test:unit": "vitest tests/unit",
  "test:components": "vitest tests/components",
  "test:coverage": "vitest --coverage",
  "test:watch": "vitest --watch",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

---

## 11. Plan de Implementación

| Fase | Tarea                                                                                          | Entregable verificable                              |
| ---- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1    | Instalar Vitest, React Testing Library, jsdom y msw. Configurar `vitest.config.js` y `.env.test` | `npm test` corre sin errores (0 tests)            |
| 2    | Crear helpers `renderWithProviders.jsx` y `factories.js`                                       | Helpers importables sin errores                     |
| 3    | Tests unitarios de validaciones (13 tests)                                                     | 13 tests pasan, commit                              |
| 4    | Tests de componentes de `PrivateRoute` y `AdminRoute` (4 tests)                                | 4 tests pasan, commit                               |
| 5    | Tests de componentes de `AuthPage` (17 tests)                                                  | 17 tests pasan, commit                              |
| 6    | Tests de componentes de `UsersPage` (6 tests)                                                  | 6 tests pasan, commit                               |
| 7    | Configurar coverage y verificar umbral del 80%                                                 | `npm run test:coverage` pasa sin errores, commit    |
| 8    | Instalar y configurar Playwright                                                               | `npm run test:e2e` corre sin errores (0 tests)      |
| 9    | Tests E2E de auth flows (7 tests)                                                              | 7 tests pasan con backend corriendo, commit         |
| 10   | Tests E2E de profile flows (4 tests)                                                           | 4 tests pasan con backend corriendo, commit         |
| 11   | Tests E2E de users flows (6 tests)                                                             | 6 tests pasan con backend corriendo, commit         |

---

## 12. Convención de Commits

Esta convención extiende la definida en `docs/spec-frontend.md` agregando el prefijo `test:`.

| Prefijo  | Cuándo usarlo                                                          |
| -------- | ---------------------------------------------------------------------- |
| `chore:` | Configuración de Vitest/Playwright, instalación de dependencias, setup |
| `test:`  | Agregar o modificar tests (unitarios, componentes o E2E)               |
| `fix:`   | Corregir un test que estaba mal planteado                              |

**Ejemplos concretos para este proyecto:**

```bash
git commit -m "chore: setup Vitest y React Testing Library"
git commit -m "chore: add helpers renderWithProviders y factories"
git commit -m "test: unit tests validaciones"
git commit -m "test: component tests PrivateRoute y AdminRoute"
git commit -m "test: component tests AuthPage"
git commit -m "test: component tests UsersPage"
git commit -m "chore: configure coverage threshold 80%"
git commit -m "chore: setup Playwright"
git commit -m "test: e2e auth flows"
git commit -m "test: e2e profile flows"
git commit -m "test: e2e users flows"
```

---

_Este spec referencia `docs/spec-frontend.md` como fuente de verdad de pantallas, rutas, manejo de errores y comportamiento esperado._
