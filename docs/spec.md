# Spec — Frontend: Administrador de Usuarios

**Versión:** 1.0  
**Fecha:** 2026-03-06  
**Metodología:** Spec-Driven Development (SDD)  
**Repositorio relacionado:** `user-management-api` (backend)

---

## 1. Descripción del Proyecto

Interfaz web que consume la API REST del administrador de usuarios. Permite a los usuarios autenticarse, ver y editar su propio perfil, y a los administradores gestionar todos los usuarios del sistema.

**Objetivo principal:** Proveer una interfaz funcional, clara y bien organizada que refleje exactamente las capacidades y restricciones definidas en el spec del backend.

**Alcance de esta versión (v1.0):**

- Autenticación: login y registro en una sola pantalla con toggle
- Panel de administración: lista de usuarios con paginación
- Detalle de usuario: ver, editar y eliminar desde una misma pantalla
- Perfil propio: ver y editar usando los endpoints `GET/PUT /api/auth/me`
- Protección de rutas según rol (`admin` / `user`)

---

## 2. Stack Técnico

| Categoría            | Tecnología / Librería              | Propósito                                                    |
| -------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Lenguaje             | JavaScript (ES6+)                  | Lenguaje principal                                           |
| Librería UI          | React 18                           | Construcción de interfaces                                   |
| Build tool           | Vite                               | Bundler y servidor de desarrollo                             |
| Routing              | React Router v6                    | Navegación entre pantallas                                   |
| Estado global        | Zustand                            | Usuario logueado y token JWT                                 |
| Llamadas a la API    | Axios                              | HTTP client con interceptores                                |
| Estilos              | Tailwind CSS                       | Clases utilitarias                                           |
| Componentes UI       | shadcn (latest CLI)                | Componentes accesibles y customizables (reemplaza shadcn-ui) |
| Validación forms     | React Hook Form                    | Manejo y validación de formularios                           |
| Debounce             | use-debounce                       | Retraso en búsqueda para no saturar la API                   |
| Tema                 | Tailwind dark mode + `next-themes` | Toggle claro/oscuro con persistencia en `localStorage`       |
| Control de versiones | Git + GitHub                       | Historial de cambios y repositorio remoto                    |

---

## 3. Pantallas y Rutas

| Ruta         | Componente / Página | Acceso              | Descripción                                                                      |
| ------------ | ------------------- | ------------------- | -------------------------------------------------------------------------------- |
| `/`          | Redirect            | Público             | Redirige a `/login` si no autenticado, a `/users` si admin, a `/profile` si user |
| `/login`     | `AuthPage`          | Solo no autenticado | Login y registro en una sola pantalla con toggle                                 |
| `/users`     | `UsersPage`         | Solo `admin`        | Lista paginada de usuarios                                                       |
| `/users/:id` | `UserDetailPage`    | Solo `admin`        | Ver, editar y eliminar un usuario                                                |
| `/profile`   | `ProfilePage`       | Autenticado         | Ver y editar perfil propio                                                       |
| `*`          | `NotFoundPage`      | Cualquiera          | Página 404                                                                       |

---

## 4. Descripción de Pantallas

### 4.1 AuthPage — `/login`

Pantalla única con dos modos: **Login** y **Registro**, que se alternan con un toggle o tabs.

**Modo Login:**

- Campos: `email`, `password`
- Botón: "Iniciar sesión"
- Llama a: `POST /api/auth/login`
- Al éxito: guarda token y usuario en Zustand, redirige según rol (`/users` para admin, `/profile` para user)
- **Errores de validación local** (campo vacío, formato de email inválido): se muestran debajo del campo correspondiente en tiempo real.
- **Errores de la API** (credenciales incorrectas, usuario inactivo): se muestran como mensaje general encima del botón de submit.

**Modo Registro:**

- Campos: `name`, `email`, `password`, `confirmar password`
- Botón: "Crear cuenta"
- Llama a: `POST /api/auth/register`
- Al éxito: hace login automático y redirige según rol
- **Validaciones locales del campo `password`** (mismos requisitos que el backend):
  - Mínimo 8 caracteres
  - Al menos una letra mayúscula
  - Al menos una letra minúscula
  - Al menos un número
- **Validación de `confirmar password`**: debe coincidir con `password`. Error debajo del campo si no coincide.
- **Errores de la API** (email ya registrado): mensaje general encima del botón de submit.

**Comportamiento compartido:**

- Si el usuario ya está autenticado y navega a `/login`, redirige automáticamente.
- Al cambiar entre modo Login y Registro, el formulario se resetea completamente.

---

### 4.2 UsersPage — `/users`

Lista paginada de todos los usuarios activos. Solo accesible para `admin`.

**Contenido:**

- Barra de búsqueda: filtra por nombre o email llamando al backend con `?search=`
- Tabla con columnas: `Nombre`, `Email`, `Rol`, `Fecha de creación`, `Acciones`
- Columna Acciones: botón "Ver detalle" que navega a `/users/:id`
- Paginación: controles de siguiente/anterior y selector de página
- Indicador de total de usuarios y página actual

**Comportamiento:**

- Al cargar: llama a `GET /api/users?page=1&limit=10`
- Al escribir en el buscador: llama a `GET /api/users?page=1&limit=10&search=<término>` con debounce de 400ms para no disparar un request por cada tecla
- Al cambiar de página: mantiene el `search` activo si hay uno
- Al limpiar el buscador: vuelve a la lista completa desde página 1
- Si no hay resultados: muestra estado vacío con mensaje "No se encontraron usuarios"

---

### 4.3 UserDetailPage — `/users/:id`

Pantalla única con tres modos: **Vista**, **Edición** y confirmación de **Eliminación**.

**Modo Vista (default):**

- Muestra: `nombre`, `email`, `rol`, `estado (activo/inactivo)`, `fecha de creación`, `fecha de actualización`
- Botón "Editar" → activa modo edición
- Botón "Eliminar" → abre modal de confirmación
- Llama a: `GET /api/users/:id` al cargar

**Modo Edición (activado con botón):**

- Los campos `nombre`, `email`, `rol` se vuelven editables
- Campo `password` opcional: si se deja vacío no se actualiza
- Botón "Guardar cambios" → llama a `PUT /api/users/:id`
- Botón "Cancelar" → vuelve a modo Vista sin guardar
- Al éxito: vuelve a modo Vista con datos actualizados

**Modal de Eliminación:**

- Mensaje de confirmación: "¿Estás seguro que querés desactivar a [nombre]? Esta acción no se puede deshacer."
- Botón "Confirmar" → llama a `DELETE /api/users/:id`
- Botón "Cancelar" → cierra el modal
- Al éxito: redirige a `/users`

**Reglas:**

- Solo `admin` puede cambiar el campo `rol`
- Un admin no puede eliminarse a sí mismo (botón "Eliminar" deshabilitado si el usuario es el mismo que está logueado)

---

### 4.4 ProfilePage — `/profile`

Pantalla del perfil propio. Misma lógica que `UserDetailPage` pero usa los endpoints `auth/me`.

**Modo Vista (default):**

- Muestra: `nombre`, `email`, `rol`, `fecha de creación`
- Botón "Editar perfil" → activa modo edición
- Llama a: `GET /api/auth/me` al cargar

**Modo Edición:**

- Campos editables: `nombre`, `email`, `password` (opcional)
- Campo `rol` no editable (un usuario no puede cambiar su propio rol)
- Botón "Guardar cambios" → llama a `PUT /api/auth/me`
- Botón "Cancelar" → vuelve a modo Vista
- Al éxito: actualiza el estado global de Zustand con los nuevos datos

**Botón "Cerrar sesión":**

- Llama a `POST /api/auth/logout`
- Limpia el estado de Zustand
- Redirige a `/login`

---

## 5. Estado Global (Zustand)

El store de Zustand maneja la sesión del usuario. Es la única fuente de verdad sobre quién está logueado.

```javascript
// Estructura del store
{
  user: {
    _id: String,
    name: String,
    email: String,
    role: "admin" | "user"
  } | null,
  token: String | null,

  // Acciones
  setSession: (user, token) => void,  // login exitoso
  clearSession: () => void,           // logout
  updateUser: (user) => void          // después de editar perfil
}
```

**Persistencia:** el token y el usuario se guardan en `localStorage` para sobrevivir recargas de página. Al iniciar la app, Zustand rehidrata el estado desde `localStorage`.

---

## 6. Axios: Configuración e Interceptores

Se crea una instancia de Axios configurada con la URL base del backend. No se usa `axios` directamente en los componentes, sino siempre esta instancia.

```javascript
// src/api/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

**Interceptor de request:** agrega automáticamente el header `Authorization: Bearer <token>` a todos los requests si hay un token en el store de Zustand. Así ningún componente tiene que acordarse de agregarlo manualmente.

**Interceptor de response:** si el backend devuelve un error `401`, limpia la sesión de Zustand y redirige a `/login`. Esto maneja el caso de token expirado de forma global.

---

## 7. Protección de Rutas

Se implementan componentes de protección utilizando el patrón de **Layout Routes** de React Router. Estos componentes actúan como "envoltorios" que verifican condiciones (token, rol) antes de renderizar sus rutas hijas mediante el componente `<Outlet />`.

**`PrivateRoute`:** redirige a `/login` si el usuario no está autenticado (falta de token en el store).

**`AdminRoute`:** redirige a `/profile` si el usuario está autenticado pero no tiene el rol `admin`.

**`PublicOnlyRoute`:** redirige a `/` si el usuario ya está autenticado, evitando que acceda a la pantalla de login/registro.

```
/users       → AdminRoute  → PrivateRoute  → UsersPage
/users/:id   → AdminRoute  → PrivateRoute  → UserDetailPage
/profile     → PrivateRoute               → ProfilePage
/login       → PublicOnlyRoute            → AuthPage (redirige si ya autenticado)
```

---

## 8. Manejo de Errores

El frontend distingue dos tipos de errores con comportamientos distintos.

---

### Tipo 1 — Errores de validación local

Son errores detectados **antes de llamar a la API**, directamente en el cliente. Los maneja React Hook Form de forma nativa.

**Cuándo ocurren:** campo vacío, formato de email inválido, contraseñas que no coinciden, contraseña que no cumple los requisitos de seguridad.

**Dónde se muestran:** debajo del campo correspondiente, en tiempo real mientras el usuario escribe o al intentar hacer submit.

**Ejemplo visual:**

```
[ ana@                        ]
  ⚠ Ingresá un email válido.

[ ••••••                      ]
  ⚠ La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
```

---

### Tipo 2 — Errores de la API

Son errores devueltos por el backend después de una llamada HTTP. El backend siempre responde con este formato estándar:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "El email ya está registrado."
  }
}
```

**Dónde se muestran:** como mensaje general encima del botón de submit, usando el texto de `error.message` de la respuesta. No se asignan a ningún campo específico.

**Ejemplo visual:**

```
┌─────────────────────────────────────────┐
│ ⚠ El email ya está registrado.          │
└─────────────────────────────────────────┘

[ Crear cuenta ]
```

**Tabla de errores por código y mensaje mostrado al usuario:**

| HTTP | `error.code`            | Mensaje mostrado en UI                             |
| ---- | ----------------------- | -------------------------------------------------- |
| 400  | `VALIDATION_ERROR`      | Se usa `error.message` directo de la API           |
| 401  | `UNAUTHORIZED`          | El interceptor redirige a `/login` automáticamente |
| 403  | `FORBIDDEN`             | "No tenés permisos para realizar esta acción."     |
| 404  | `NOT_FOUND`             | "Usuario no encontrado."                           |
| 409  | `CONFLICT`              | Se usa `error.message` directo de la API           |
| 500  | `INTERNAL_SERVER_ERROR` | "Ocurrió un error inesperado. Intentá más tarde."  |
| —    | Sin respuesta           | "No se pudo conectar con el servidor."             |

> Para los códigos `400` y `409` se muestra el `error.message` de la API directamente porque el backend ya devuelve mensajes claros y accionables para el usuario ("El campo email es requerido.", "El email ya está registrado."). Para `500` se muestra un mensaje genérico porque el mensaje interno del servidor no es relevante para el usuario.

---

## 9. Seguridad

### Almacenamiento del token

El token JWT se guarda en `localStorage` via el middleware `persist` de Zustand. Es accesible desde JavaScript, por lo que la protección contra XSS es crítica para mitigar el riesgo de robo de token.

### Prácticas obligatorias contra XSS

**1. Nunca usar `dangerouslySetInnerHTML`**
React escapa el contenido automáticamente al renderizar. `dangerouslySetInnerHTML` bypasea esa protección y no debe usarse bajo ninguna circunstancia, especialmente con datos que vengan del usuario o de la API.

**2. Nunca construir URLs dinámicas con datos del usuario sin validar**
Un valor como `javascript:alert(1)` en un `href` es un vector XSS clásico. Si alguna URL se construye dinámicamente, debe validarse que empiece con `http://` o `https://` antes de usarse.

**3. Mínima exposición de datos en el store**
El objeto `user` en Zustand debe contener únicamente los campos necesarios para la UI:

```javascript
// ✅ Correcto
{ _id, name, email, role }

// ❌ Nunca guardar
{ password, isActive, __v, ...camposInternos }
```

**4. Variables de entorno solo para configuración pública**
En Vite, todo lo que empiece con `VITE_` es accesible en el cliente y visible en el bundle final. Solo se deben poner valores de configuración pública como `VITE_API_URL`. Nunca secretos, claves privadas ni tokens de terceros.

**5. Limpiar sesión ante token inválido**
El interceptor de response de Axios debe limpiar `localStorage` y el store de Zustand inmediatamente ante cualquier respuesta `401`, sin excepción. Esto garantiza que tokens expirados o inválidos no persistan en el cliente.

**6. HTTPS obligatorio en producción**
Sin HTTPS, el token viaja en texto plano por la red. Las plataformas de deploy (Vercel, Netlify, Railway) lo configuran automáticamente. No se debe hacer deploy sobre HTTP bajo ninguna circunstancia.

---

## 11. Variables de Entorno

Archivo `.env.example`:

```
VITE_API_URL=http://localhost:3000/api
```

En producción este valor cambia a la URL del backend desplegado.

---

## 12. Estructura de Carpetas

```
user-management-client/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Instancia configurada + interceptores
│   │   ├── auth.api.js       # Llamadas a /api/auth/*
│   │   └── users.api.js      # Llamadas a /api/users/*
│   ├── components/
│   │   ├── ui/               # Componentes de shadcn (auto-generados mediante CLI)
│   │   └── shared/           # Componentes reutilizables propios (Navbar, Spinner, ThemeToggle, etc.)
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── UserDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── routes/
│   │   ├── PrivateRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   └── PublicOnlyRoute.jsx
│   ├── store/
│   │   └── authStore.js      # Store de Zustand con persistencia
│   ├── App.jsx               # Definición de rutas con React Router
│   ├── main.jsx              # Entry point
│   └── index.css             # Estilos globales + directivas de Tailwind
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 13. Plan de Implementación (Orden de Construcción)

El proyecto se construye en fases. **No se avanza a la siguiente fase hasta que la actual funciona correctamente.**

| Fase | Tarea                                                                                                                                                                                          | Entregable verificable                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1    | Crear repositorio en GitHub, `git init` local, primer commit con README y spec                                                                                                                 | Repositorio visible en GitHub                                                                                  |
| 2    | Setup: `npm create vite`, instalar dependencias, configurar Tailwind, `shadcn` CLI y `next-themes`                                                                                             | App en blanco corre en `localhost:5173`, toggle claro/oscuro funciona, commit "chore: project setup"           |
| 3    | Infraestructura base: React Router con páginas placeholder + Zustand store con persistencia + Axios con interceptores de request y response + `PrivateRoute`, `AdminRoute` y `PublicOnlyRoute` | Rutas protegidas redirigen correctamente, sesión persiste al recargar, interceptores funcionan, commit         |
| 4    | `AuthPage` completa: modo Login, modo Registro con toggle, validaciones locales, confirmación de contraseña y manejo de errores de la API                                                      | Login y registro funcionan end-to-end, errores se muestran correctamente, commit                               |
| 5    | `ProfilePage` completa: modo Vista + modo Edición + botón de logout                                                                                                                            | Ver y editar perfil propio funciona, logout limpia sesión y redirige, commit                                   |
| 6    | `UsersPage` completa: tabla paginada + buscador con debounce                                                                                                                                   | Lista usuarios con paginación y búsqueda funcionales, commit                                                   |
| 7    | `UserDetailPage` completa: modo Vista + modo Edición + modal de eliminación                                                                                                                    | Ver, editar y soft-delete de usuario funcionan correctamente, commit                                           |
| 8    | Cierre: manejo de errores global en todas las pantallas + `NotFoundPage` + redirect en `/`                                                                                                     | Todos los errores de la API se muestran en UI, rutas inválidas muestran 404, redirect inicial funciona, commit |
| 9    | Pruebas manuales completas con el backend corriendo                                                                                                                                            | Todos los flujos funcionan end-to-end                                                                          |

**Convención de commits:**

- `feat:` — nueva pantalla o funcionalidad
- `fix:` — corrección de bug
- `chore:` — configuración, dependencias, setup
- `style:` — cambios de estilos sin impacto funcional

---

## 14. Decisiones Diferidas (fuera del alcance v1.0)

- **Deploy** del frontend (Vercel, Netlify, etc.) — se decide junto con el deploy del backend
- **Migración a cookies HttpOnly** — reemplaza localStorage para almacenamiento del token; requiere cambios coordinados en el backend (set-cookie en login, CSRF protection). Se evalúa al momento del deploy.
- **Internacionalización (i18n)** — textos en un solo idioma por ahora
- **Tests automatizados** — Vitest + React Testing Library

- **Refresh tokens** — depende de que el backend los implemente primero

---

_Documento generado como parte del proceso SDD. Ninguna línea de código se escribe antes de que este spec esté acordado._
