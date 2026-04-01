# SKILL — Modo de Trabajo para este Proyecto (Frontend)

## Contexto
Este proyecto sigue **Spec-Driven Development (SDD)**. El archivo `docs/spec.md`
es la fuente de verdad. Toda decisión técnica debe ser coherente con lo que
define ese documento.

El objetivo principal no es solo que el código funcione, sino que el desarrollador
**entienda cada decisión**. Este es un proyecto de aprendizaje.

---

## Reglas que debes seguir siempre

### Antes de escribir cualquier código
1. Identificá qué fase del plan de implementación (sección 13 del spec) se está trabajando.
2. Explicá en 2-3 oraciones qué vas a hacer y por qué, referenciando la sección
   del spec que aplica.
3. Esperá confirmación antes de proceder. No asumas aprobación.

### Al escribir código
4. Respetá estrictamente la estructura de carpetas definida en la sección 12 del spec.
   Cada archivo va en su carpeta correspondiente sin excepción:
   - Llamadas a la API → `src/api/`
   - Páginas completas → `src/pages/`
   - Componentes reutilizables propios → `src/components/shared/`
   - Componentes de shadcn/ui → `src/components/ui/` (nunca editar)
   - Guards de rutas → `src/routes/`
   - Estado global → `src/store/`
5. Cada archivo que crees debe tener un comentario al inicio explicando
   su responsabilidad dentro del proyecto.
6. Nunca llames a Axios directamente desde un componente o página.
   Todas las llamadas HTTP van a través de las funciones definidas en `src/api/`.
7. Nunca guardes en el store de Zustand más campos de los definidos en la
   sección 5 del spec: solo `_id`, `name`, `email` y `role`. Nunca `password`,
   `isActive` ni campos internos.
8. Nunca uses `dangerouslySetInnerHTML`. Es una regla de seguridad no negociable
   definida en la sección 9 del spec.
9. Nunca tomes decisiones que contradigan el spec sin señalarlo explícitamente
   y pedir aprobación primero.

### Al manejar errores
10. Distinguí siempre entre los dos tipos de errores definidos en la sección 8 del spec:
    - **Errores de validación local** → debajo del campo correspondiente, manejados por React Hook Form.
    - **Errores de la API** → mensaje general usando `error.message` de la respuesta del backend,
      mostrado encima del botón de submit. Nunca ignorar un error silenciosamente.
11. El interceptor de Axios debe limpiar la sesión y redirigir a `/login` ante cualquier `401`,
    sin excepción.

### Al terminar cada fragmento de código
12. Explicá qué hace el código que acabás de escribir, en lenguaje simple,
    sin asumir que el desarrollador ya lo sabe.
13. Indicá exactamente cómo verificar que funciona: qué ver en el navegador,
    qué interacción hacer, qué respuesta esperar, qué revisar en las DevTools.
14. Recordá el mensaje de commit sugerido siguiendo la convención del spec
    (`feat:`, `fix:`, `chore:`, `style:`).

### Lo que nunca debes hacer
- Implementar más de una fase por turno, aunque el desarrollador lo pida.
- Escribir código de una fase sin haber confirmado que la fase anterior funciona.
- Omitir la explicación previa al código bajo ninguna circunstancia.
- Tomar decisiones de diseño que no estén en el spec sin advertirlo.
- Mezclar lógica de negocio dentro de un componente de UI. Las páginas orquestan,
  los componentes renderizan.

---

## Formato de respuesta esperado

Usá siempre esta estructura al trabajar en una fase:

**📋 Fase X — [nombre de la fase]**
> Referencia al spec: sección Y

**¿Qué vamos a hacer?**
[Explicación breve en lenguaje simple]

**¿Por qué lo hacemos así?**
[Justificación de la decisión técnica o de diseño]

---
[código]
---

**¿Qué hace este código?**
[Explicación bloque por bloque. No asumir conocimiento previo del desarrollador]

**✅ Cómo verificar que funciona**
[Instrucciones concretas: qué abrir, qué hacer, qué esperar ver]

**📝 Commit sugerido**
`tipo: descripción`
