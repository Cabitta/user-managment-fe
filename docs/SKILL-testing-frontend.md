# SKILL — Modo de Trabajo: Testing del Frontend

## Contexto
Esta skill complementa `docs/SKILL.md`. Leé ambas antes de arrancar.
El spec de testing `docs/spec-testing-frontend.md` es la fuente de verdad
para todo lo relacionado con tests. `docs/spec-frontend.md` es la fuente
de verdad para pantallas, rutas, manejo de errores y comportamiento esperado.

---

## Reglas específicas de testing

### Antes de escribir cualquier test
1. Identificá exactamente qué fase del plan de implementación (sección 11
   del spec de testing) se está trabajando.
2. Leé los casos de test de esa suite completos antes de escribir el primero.
   No escribas tests de memoria ni por intuición.
3. Confirmá con el desarrollador antes de proceder. No asumas aprobación.

### Estructura y naming
4. Seguí estrictamente la estructura de carpetas de la sección 3 del spec
   de testing. Los archivos van exactamente donde el spec indica:
   - Tests unitarios → `tests/unit/`
   - Tests de componentes → `tests/components/`
   - Tests E2E → `tests/e2e/`
   - Helpers → `tests/helpers/`
5. El naming de los archivos de test es:
   - `[nombre].test.js` para tests unitarios y de componentes
   - `[nombre].spec.js` para tests E2E con Playwright
6. El naming interno de los tests sigue este patrón sin excepción:
   ```javascript
   describe('[NombreComponente/Función]', () => {
     describe('[comportamiento o escenario]', () => {
       it('[debería + comportamiento esperado]', async () => { ... })
     })
   })
   ```

### Tests unitarios
7. Los tests unitarios **nunca** renderizan componentes ni hacen llamadas HTTP.
   Son funciones puras que se llaman directamente y se verifica su retorno.
8. Usá siempre los helpers de `tests/helpers/factories.js` para generar datos
   de prueba. Nunca hardcodees objetos directamente en el test.
9. Cada test verifica **una sola cosa**. Si un test tiene más de un `expect`
   que no son parte de la misma aserción, probablemente está testeando
   demasiado y hay que dividirlo.

### Tests de componentes
10. Siempre usá `renderWithProviders` de `tests/helpers/renderWithProviders.jsx`
    para renderizar componentes. Nunca uses `render` de React Testing Library
    directamente, ya que los componentes necesitan Router, store y ThemeProvider.
11. Todas las llamadas a la API se interceptan con **msw**. Nunca hagas llamadas
    reales al backend en tests de componentes.
    ```javascript
    // Configurar msw antes de los tests
    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
    ```
12. Testeá el comportamiento visible para el usuario, no los detalles de
    implementación. Preferí queries accesibles en este orden:
    `getByRole` → `getByLabelText` → `getByText` → `getByTestId`
13. Para simular interacciones usá siempre `userEvent` en lugar de `fireEvent`.
    `userEvent` simula el comportamiento real del navegador (foco, blur, etc.).
    ```javascript
    // ❌ Incorrecto
    fireEvent.click(button)
    // ✅ Correcto
    await userEvent.click(button)
    ```
14. Para verificar errores de validación, siempre esperá a que aparezcan
    en el DOM con `findByText` o `waitFor`, ya que React Hook Form los
    muestra de forma asíncrona.

### Tests E2E
15. Los tests E2E requieren el **backend corriendo en `localhost:3000`** y el
    **frontend corriendo en `localhost:5173`**. Verificá esto antes de arrancar
    la suite. Si alguno no está corriendo, los tests van a fallar con errores
    de conexión, no con errores de lógica.
16. Nunca compartas estado entre tests E2E. Cada test crea sus propios datos
    desde cero. Si un test crea un usuario, el siguiente test no puede asumir
    que ese usuario existe.
17. Usá los locators de Playwright en este orden de preferencia:
    `getByRole` → `getByLabel` → `getByText` → `locator('[data-testid]')`
18. Cada test E2E debe terminar en un estado limpio. Si el test crea datos
    en la DB, agregá una limpieza en `afterEach` o usá una cuenta de test
    dedicada que se resetea entre suites.

### Coverage
19. El coverage se mide solo para tests unitarios y de componentes, no para E2E.
    Corré `npm run test:coverage` después de completar la fase 7 del plan.
20. No escribas tests vacíos o triviales para inflar el coverage.
    Un test que no tiene al menos un `expect` significativo no cuenta.
21. Si el coverage cae por debajo del 80%, no avancés a la siguiente
    fase hasta resolverlo.

### Lo que nunca debes hacer
- Modificar el código fuente de `src/` para hacer pasar un test.
  Si un test falla, el problema puede estar en el test o en el código,
  pero la decisión de qué cambiar la toma el desarrollador.
- Avanzar a la siguiente fase si algún test de la fase actual falla.
- Saltear casos de test del spec aunque parezcan redundantes.
- Usar `test.skip` o `it.skip` sin advertirlo explícitamente y pedir aprobación.
- Hacer llamadas reales a la API en tests de componentes. Para eso están los E2E.

---

## Formato de respuesta esperado

Usá siempre esta estructura al trabajar en una fase de testing:

**🧪 Fase X — [nombre de la suite]**
> Referencia al spec de testing: sección Y
> Casos cubiertos: N (happy: X, sad: Y)

**¿Qué vamos a testear?**
[Descripción de la suite y qué comportamiento cubre]

**¿Por qué testeamos esto así?**
[Unitario vs componente vs E2E, qué se mockea y por qué]

---
[código]
---

**¿Qué hace este código?**
[Explicación bloque por bloque: describe, beforeEach, cada it]

**✅ Cómo verificar que funciona**
```bash
npm run test:unit        # para tests unitarios
npm run test:components  # para tests de componentes
npm run test:coverage    # al finalizar la fase 7
npm run test:e2e         # para tests E2E (requiere backend y frontend corriendo)
```
Resultado esperado: X tests passed, 0 failed

**📝 Commit sugerido**
`test: [descripción de la suite agregada]`
