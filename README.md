# User Management — Frontend

Interfaz web para el administrador de usuarios. Construida con React + Vite, consume la [API REST del backend](https://github.com/tuusuario/user-management-api) y permite autenticarse, gestionar usuarios y editar el perfil propio.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
- [Variables de entorno](#variables-de-entorno)
- [Correr en desarrollo](#correr-en-desarrollo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pantallas y rutas](#pantallas-y-rutas)
- [Arquitectura y decisiones técnicas](#arquitectura-y-decisiones-técnicas)
- [Seguridad](#seguridad)
- [Convención de commits](#convención-de-commits)
- [Repositorio del backend](#repositorio-del-backend)

---

## Descripción

Panel web que consume la API REST de administración de usuarios. Soporta dos roles:

- **admin** — puede listar, ver, editar y eliminar cualquier usuario del sistema.
- **user** — solo puede ver y editar su propio perfil.

Las rutas están protegidas según el rol. Un `user` que intente acceder a `/users` es redirigido automáticamente a su perfil. Un visitante no autenticado es redirigido a `/login`.

---

## Stack tecnológico

| Categoría            | Tecnología              | Versión  |
|----------------------|-------------------------|----------|
| Librería UI          | React                   | 18       |
| Build tool           | Vite                    | latest   |
| Routing              | React Router            | v6       |
| Estado global        | Zustand                 | latest   |
| HTTP client          | Axios                   | latest   |
| Estilos              | Tailwind CSS            | v3       |
| Componentes UI       | shadcn/ui               | latest   |
| Validación de forms  | React Hook Form         | latest   |
| Debounce             | use-debounce            | latest   |
| Modo oscuro          | next-themes             | latest   |
| Lenguaje             | JavaScript ES6+         | —        |

---

## Requisitos previos

- **Node.js** v20 o superior
- **npm** v9 o superior
- El **backend** corriendo localmente o desplegado — ver [user-management-api](https://github.com/tuusuario/user-management-api)

---

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/tuusuario/user-management-client.git
cd user-management-client

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend (ver sección Variables de entorno)
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

| Variable        | Descripción                              | Ejemplo                          |
|-----------------|------------------------------------------|----------------------------------|
| `VITE_API_URL`  | URL base de la API REST del backend      | `http://localhost:3000/api`      |

> **Importante:** En Vite, todas las variables que empiezan con `VITE_` son accesibles en el cliente y quedan expuestas en el bundle final. No pongas secretos ni claves privadas en el `.env`.

En producción, cambiar el valor a la URL del backend desplegado.

---

## Correr en desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

El backend debe estar corriendo en paralelo para que las llamadas a la API funcionen.

---

## Estructura del proyecto

```
user-management-client/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js              # Instancia de Axios + interceptores de auth y errores
│   │   ├── auth.api.js           # Funciones para /api/auth/* (login, register, logout, me)
│   │   └── users.api.js          # Funciones para /api/users/* (CRUD + paginación)
│   ├── components/
│   │   ├── ui/                   # Componentes de shadcn/ui (auto-generados, no editar)
│   │   └── shared/               # Componentes reutilizables propios
│   │       ├── Navbar.jsx        # Barra de navegación con toggle de tema
│   │       ├── Spinner.jsx       # Indicador de carga
│   │       └── ThemeToggle.jsx   # Botón claro/oscuro
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login y registro con toggle
│   │   ├── UsersPage.jsx         # Lista paginada de usuarios (solo admin)
│   │   ├── UserDetailPage.jsx    # Ver, editar y eliminar usuario (solo admin)
│   │   ├── ProfilePage.jsx       # Ver y editar perfil propio
│   │   └── NotFoundPage.jsx      # Página 404
│   ├── routes/
│   │   ├── PrivateRoute.jsx      # Redirige a /login si no autenticado
│   │   ├── AdminRoute.jsx        # Redirige a /profile si no es admin
│   │   └── PublicOnlyRoute.jsx   # Redirige al home si ya autenticado
│   ├── store/
│   │   └── authStore.js          # Store de Zustand: usuario, token y acciones de sesión
│   ├── App.jsx                   # Definición de todas las rutas
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Estilos globales + directivas de Tailwind
├── .env                          # Variables de entorno locales (no se sube a git)
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Pantallas y rutas

| Ruta           | Página              | Acceso              | Descripción                                                   |
|----------------|---------------------|---------------------|---------------------------------------------------------------|
| `/`            | Redirect            | Cualquiera          | Redirige según estado: `/login`, `/users` (admin) o `/profile` (user) |
| `/login`       | `AuthPage`          | Solo no autenticado | Login y registro en una pantalla con toggle entre modos       |
| `/users`       | `UsersPage`         | Solo `admin`        | Tabla paginada con buscador por nombre/email y todos los usuarios activos |
| `/users/:id`   | `UserDetailPage`    | Solo `admin`        | Ver, editar y eliminar un usuario específico                  |
| `/profile`     | `ProfilePage`       | Autenticado         | Ver y editar el perfil del usuario logueado                   |
| `*`            | `NotFoundPage`      | Cualquiera          | Página 404 para rutas inexistentes                            |

### Flujo de navegación por rol

```
No autenticado
  └── / → /login

Usuario (role: "user")
  └── / → /profile
  └── /users → /profile (redirigido)

Administrador (role: "admin")
  └── / → /users
  └── /users → lista de usuarios
  └── /users/:id → detalle y gestión del usuario
  └── /profile → perfil propio
```

---

## Arquitectura y decisiones técnicas

### Llamadas a la API

Nunca se usa `axios` directamente en los componentes. Todas las llamadas pasan por funciones en `src/api/`:

```javascript
// ✅ Correcto
import { getUsers } from '../api/users.api'
const users = await getUsers({ page: 1, limit: 10 })

// ❌ Incorrecto
import axios from 'axios'
const users = await axios.get('/api/users')
```

Esto centraliza el manejo de errores, facilita cambiar la implementación y hace el código más legible.

### Interceptores de Axios

**Request:** agrega automáticamente el header `Authorization: Bearer <token>` a todos los requests si hay una sesión activa. Ningún componente tiene que acordarse de hacerlo.

**Response:** ante cualquier respuesta `401` (token expirado o inválido), limpia la sesión de Zustand y `localStorage`, y redirige a `/login` de forma automática.

### Búsqueda en UsersPage

El buscador de `/users` llama al backend con `?search=<término>` en lugar de filtrar en el frontend. Esto garantiza que la búsqueda opera sobre todos los usuarios del sistema, no solo los de la página visible. Se usa `use-debounce` con 400ms para evitar un request por cada tecla.

### Estado global (Zustand)

El store maneja únicamente los datos de sesión necesarios para la UI:

```javascript
{
  user: { _id, name, email, role } | null,
  token: String | null,
  setSession: (user, token) => void,
  clearSession: () => void,
  updateUser: (user) => void
}
```

La sesión persiste en `localStorage` a través del middleware `persist` de Zustand, por lo que el usuario sigue logueado al recargar la página.

### Modo oscuro

Implementado con `next-themes` + Tailwind CSS dark mode. La preferencia del usuario se guarda en `localStorage` automáticamente. El toggle está disponible en la navbar en todas las pantallas autenticadas.

---

## Seguridad

### Token en localStorage

El token JWT se almacena en `localStorage` via Zustand persist. Para reducir el riesgo de robo por XSS, se aplican las siguientes prácticas en toda la codebase:

- **`dangerouslySetInnerHTML` está prohibido.** React escapa el contenido automáticamente; nunca se bypasea esa protección.
- **URLs dinámicas se validan.** Si alguna URL se construye con datos externos, se verifica que empiece con `http://` o `https://`.
- **Mínima exposición en el store.** El objeto `user` solo contiene `_id`, `name`, `email` y `role`. Nunca `password`, `isActive` ni campos internos.
- **Limpieza inmediata ante 401.** El interceptor de Axios limpia `localStorage` y el store ante cualquier respuesta `401`, sin excepción.
- **HTTPS obligatorio en producción.** Sin HTTPS el token viaja en texto plano. Las plataformas de deploy lo configuran automáticamente.

> **Decisión diferida:** migrar el almacenamiento del token a cookies HttpOnly para eliminar el vector XSS por completo. Requiere cambios coordinados en el backend. Se evalúa al momento del deploy.

---

## Convención de commits

```
feat:   nueva pantalla o funcionalidad
fix:    corrección de bug
chore:  configuración, dependencias, setup
style:  cambios de estilos sin impacto funcional
docs:   cambios en documentación
```

Ejemplos:
```bash
git commit -m "feat: AuthPage login mode"
git commit -m "chore: setup Tailwind and shadcn/ui"
git commit -m "fix: redirect loop on PublicOnlyRoute"
```

---

## Repositorio del backend

Este frontend depende del backend para funcionar. El repositorio del backend con su propia documentación e instrucciones de instalación está en:

👉 [user-management-api](https://github.com/tuusuario/user-management-api)

Asegurate de tenerlo corriendo antes de levantar el frontend en desarrollo.
