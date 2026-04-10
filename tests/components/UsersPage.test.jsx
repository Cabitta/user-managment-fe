/**
 * tests/components/UsersPage.test.jsx — Tests de componentes para UsersPage.
 *
 * Responsabilidad: Verificar el comportamiento visible de UsersPage:
 * carga de datos, búsqueda, paginación, modal de confirmación y desactivación.
 *
 * Estrategia:
 *  - use-debounce se mockea para que retorne el valor SIN delay (ver bloque vi.mock)
 *  - Las llamadas a la API se interceptan con MSW (configurado en tests/setup.js)
 *  - server.use() sobreescribe handlers solo para el test que lo necesita
 */

import React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { vi, describe, it, expect } from "vitest";
import { renderWithProviders } from "../helpers/renderWithProviders";
import { createAdminData, createUserData } from "../helpers/factories";
import { server } from "../mocks/server";
import UsersPage from "../../src/pages/UsersPage";

// ─── MOCK DE USE-DEBOUNCE ────────────────────────────────────────────────────
// useDebounce(value, 500) normalmente retorna [debouncedValue] donde
// debouncedValue se actualiza 500ms DESPUÉS de que value cambia.
// En tests, ese delay hace que el estado nunca se actualice dentro del test.
// La solución: reemplazar useDebounce por una función que retorna [value]
// inmediatamente, sin ningún delay.
vi.mock("use-debounce", () => ({
  useDebounce: (value) => [value],
}));

const API_URL = "http://localhost:3000/api";

// Usuario administrador que se inyecta en el store para cada test.
// UsersPage solo es accesible para admins según el spec (sección 3).
const adminUser = createAdminData();

// ─── SUITE PRINCIPAL ─────────────────────────────────────────────────────────
describe("UsersPage", () => {
  // ── Test 1: Carga inicial ──────────────────────────────────────────────────
  describe("Carga inicial", () => {
    it("debería mostrar estado de carga y luego la tabla con usuarios", async () => {
      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      // Mientras espera la respuesta de la API, el componente muestra loading
      expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();

      // Cuando la API responde (handler por defecto devuelve 15 usuarios),
      // se muestran los primeros 10 (página 1)
      await waitFor(() => {
        expect(screen.getByText("Usuario 0")).toBeInTheDocument();
      });

      expect(screen.getByText("Usuario 9")).toBeInTheDocument();
      // El usuario 10 está en la página 2, no debe estar visible
      expect(screen.queryByText("Usuario 10")).not.toBeInTheDocument();
    });
  });

  // ── Test 2: Búsqueda con debounce ─────────────────────────────────────────
  describe("Búsqueda con debounce", () => {
    it("debería llamar a la API con ?search=<término> al escribir en el buscador", async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      // Espera a que cargue la lista inicial
      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      // Escribe en el buscador
      const searchInput = screen.getByPlaceholderText(
        "Buscar por nombre o email...",
      );
      await user.type(searchInput, "Usuario 5");

      // El handler filtra por nombre: solo "Usuario 5" coincide exactamente
      await waitFor(() => {
        expect(screen.getByText("Usuario 5")).toBeInTheDocument();
      });

      // Usuarios que no coinciden con "Usuario 5" no deben estar visibles
      expect(screen.queryByText("Usuario 0")).not.toBeInTheDocument();
    });
  });

  // ── Test 3: Cambio de página ───────────────────────────────────────────────
  describe("Cambio de página", () => {
    it("debería llamar a la API con ?page=2 al hacer click en Siguiente", async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      // Espera página 1
      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      // Click en "Siguiente"
      const nextButton = screen.getByRole("button", { name: /siguiente/i });
      await user.click(nextButton);

      // Página 2 tiene usuarios 10-14 (los últimos 5 de los 15 generados)
      await waitFor(() => {
        expect(screen.getByText("Usuario 10")).toBeInTheDocument();
      });

      expect(screen.getByText("Usuario 14")).toBeInTheDocument();
      // Los de página 1 ya no deben estar
      expect(screen.queryByText("Usuario 0")).not.toBeInTheDocument();
    });
  });

  // ── Test 4: Limpiar buscador ───────────────────────────────────────────────
  describe("Limpiar buscador", () => {
    it("debería volver a la lista completa al borrar el campo de búsqueda", async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      const searchInput = screen.getByPlaceholderText(
        "Buscar por nombre o email...",
      );

      // Busca algo específico
      await user.type(searchInput, "Usuario 5");
      await waitFor(() =>
        expect(screen.getByText("Usuario 5")).toBeInTheDocument(),
      );

      // Limpia el buscador
      await user.clear(searchInput);

      // Vuelve a la lista completa desde página 1
      await waitFor(() => {
        expect(screen.getByText("Usuario 0")).toBeInTheDocument();
      });
      expect(screen.getByText("Usuario 9")).toBeInTheDocument();
    });
  });

  // ── Test 5: Lista vacía ────────────────────────────────────────────────────
  describe("Lista vacía", () => {
    it('debería mostrar "No se encontraron usuarios." cuando la API devuelve lista vacía', async () => {
      // Sobreescribimos el handler solo para este test
      server.use(
        http.get(`${API_URL}/users`, () => {
          return HttpResponse.json({
            success: true,
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          });
        }),
      );

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() => {
        expect(
          screen.getByText("No se encontraron usuarios."),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Test 6: Error 500 ──────────────────────────────────────────────────────
  describe("Error de la API", () => {
    it("debería mostrar mensaje de error cuando la API devuelve 500", async () => {
      // Sobreescribimos el handler para simular error del servidor
      server.use(
        http.get(`${API_URL}/users`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error interno",
              },
            },
            { status: 500 },
          );
        }),
      );

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      // El catch del componente setea el error visible al usuario
      await waitFor(() => {
        expect(
          screen.getByText(
            "No se pudieron cargar los usuarios. Verificá la conexión con el backend.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Test 7: Límites de paginación ─────────────────────────────────────────
  describe("Paginación en límites", () => {
    it('debería tener "Anterior" disabled en pág. 1 y "Siguiente" disabled en pág. final', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      // ─ En página 1 ─
      const prevButton = screen.getByRole("button", { name: /anterior/i });
      const nextButton = screen.getByRole("button", { name: /siguiente/i });

      expect(prevButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();

      // ─ Navega a la última página ─
      await user.click(nextButton);
      await waitFor(() =>
        expect(screen.getByText("Usuario 10")).toBeInTheDocument(),
      );

      // En la última página (pág. 2 de 2), "Siguiente" debe estar disabled
      expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
      // Y "Anterior" debe estar habilitado
      expect(
        screen.getByRole("button", { name: /anterior/i }),
      ).not.toBeDisabled();
    });
  });

  // ── Test 8: Persistencia de búsqueda al cambiar página ────────────────────
  describe("Persistencia de búsqueda", () => {
    it("debería mantener el término de búsqueda al cambiar de página", async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      const searchInput = screen.getByPlaceholderText(
        "Buscar por nombre o email...",
      );

      // "usuario" coincide con todos los 15 (handler filtra por toLowerCase)
      // → totalPages = 2, podemos navegar a pág. 2
      await user.type(searchInput, "usuario");
      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      // Navega a página 2
      const nextButton = screen.getByRole("button", { name: /siguiente/i });
      await user.click(nextButton);

      await waitFor(() =>
        expect(screen.getByText("Usuario 10")).toBeInTheDocument(),
      );

      // El input debe seguir teniendo el valor de búsqueda
      expect(searchInput).toHaveValue("usuario");
    });
  });

  // ── Test 9: Reset de página al buscar ─────────────────────────────────────
  describe("Reset de página al buscar", () => {
    it("debería volver a página 1 al escribir un nuevo término de búsqueda", async () => {
      const user = userEvent.setup();

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Usuario 0")).toBeInTheDocument(),
      );

      // Navega a página 2
      const nextButton = screen.getByRole("button", { name: /siguiente/i });
      await user.click(nextButton);
      await waitFor(() =>
        expect(screen.getByText("Usuario 10")).toBeInTheDocument(),
      );

      // Escribe en el buscador desde la página 2
      const searchInput = screen.getByPlaceholderText(
        "Buscar por nombre o email...",
      );
      await user.type(searchInput, "Usuario 1");

      // El useEffect({ setCurrentPage(1) }, [debouncedSearch]) debe resetear a página 1
      await waitFor(() => {
        expect(screen.getByText(/página 1/i)).toBeInTheDocument();
      });
    });
  });

  // ── Test 10: Diálogo de confirmación ──────────────────────────────────────
  describe("Diálogo de confirmación", () => {
    it("debería abrir el modal con el nombre del usuario al hacer click en Desactivar", async () => {
      const user = userEvent.setup();

      // Devolvemos un usuario con isActive: true
      // (sin isActive, el botón de desactivar queda disabled porque !u.isActive es true)
      server.use(
        http.get(`${API_URL}/users`, () =>
          HttpResponse.json({
            success: true,
            data: [
              createUserData({ _id: "u1", name: "Ana García", isActive: true }),
            ],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          }),
        ),
      );

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      // El botón trash es un icon-only button con title="Desactivar"
      // Utilizamos un query que evite ambigüedades
      const deleteButton = screen.getByRole("button", { name: /desactivar/i });
      await user.click(deleteButton);

      // Radix UI renderiza el AlertDialog en un portal
      // Usamos findByRole para esperar explícitamente a que aparezca
      const dialog = await screen.findByRole("alertdialog");

      expect(within(dialog).getByText("¿Estás seguro?")).toBeInTheDocument();
      expect(within(dialog).getByText("Ana García")).toBeInTheDocument();
    });
  });

  // ── Test 11: Desactivación exitosa ─────────────────────────────────────────
  describe("Desactivación exitosa", () => {
    it("debería cerrar el modal y refrescar la lista tras DELETE exitoso", async () => {
      const user = userEvent.setup();

      // Handler GET devuelve un usuario activo
      // Handler DELETE responde con éxito
      server.use(
        http.get(`${API_URL}/users`, () =>
          HttpResponse.json({
            success: true,
            data: [
              createUserData({
                _id: "u1",
                name: "Carlos López",
                isActive: true,
              }),
            ],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          }),
        ),
        http.delete(`${API_URL}/users/u1`, () =>
          HttpResponse.json({ success: true }),
        ),
      );

      renderWithProviders(<UsersPage />, {
        initialStore: { user: adminUser, token: "fake-token" },
        route: "/users",
      });

      await waitFor(() =>
        expect(screen.getByText("Carlos López")).toBeInTheDocument(),
      );

      // Abre el modal usando el selector por nombre accesible
      const deleteButton = screen.getByRole("button", { name: /desactivar/i });
      await user.click(deleteButton);

      // Espera a que el portal de Radix renderice el dialog
      const dialog = await screen.findByRole("alertdialog");
      expect(within(dialog).getByText("¿Estás seguro?")).toBeInTheDocument();

      // Confirma la desactivación — el botón Confirmar también está en el portal
      const confirmButton = within(dialog).getByRole("button", {
        name: /confirmar desactivación/i,
      });
      await user.click(confirmButton);

      // Tras el DELETE exitoso, handleDelete llama setUserToDelete(null)
      // → open={!!userToDelete} pasa a false → el modal se cierra
      await waitFor(() => {
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      });
    });
  });
});
