# Feature - System prompt

## Archivos

- `src/features/chat/ui/ProjectWorkspace/ProjectWorkspace.tsx`
- Tipo `ChatProject.systemPrompt` en `chat.types.ts`
- Accion `saveSystemPrompt` en `ChatProvider.tsx`

## Responsabilidad

Permite editar instrucciones de sistema por proyecto.

Hoy el system prompt se guarda en estado local, pero no modifica las respuestas mock del asistente.

## EDD

### Entrar al tab System prompt

- Evento: ruta `/projects/{id}/system-prompt` o click en tab.
- Decision: `projectTab = system-prompt`.
- Datos: `activeProject.systemPrompt`.
- Desenlace: renderiza formulario si no hay prompt, o tarjeta de lectura si existe.

### Guardar prompt

- Evento: submit del formulario.
- Decision: no guarda si `draft.trim().length === 0`.
- Datos: `activeProject.systemPrompt`.
- Desenlace: si guarda, cambia a modo lectura.

### Editar prompt existente

- Evento: click en icono lapiz.
- Decision: copia prompt actual al draft y habilita edicion.
- Datos: estado local `draft`, `isEditing`.
- Desenlace: aparece textarea con boton Guardar y Cancelar.

### Cancelar edicion

- Evento: click en Cancelar.
- Decision: solo aparece si ya habia prompt guardado.
- Datos: `draft`, `isEditing`.
- Desenlace: descarta cambios locales y vuelve a modo lectura.

## Reglas importantes

- El componente se monta con `key={activeProject.id}` para resetear estado local al cambiar de proyecto.
- Prompt vacio mantiene la vista en modo edicion.
- Guardar no navega ni dispara respuesta.

## Notas para cambios

- Para usar el prompt en respuestas reales, `sendMessage` deberia incluir `activeProject.systemPrompt` en la llamada al backend.
- Si se necesita versionado o historial, no mutar directamente `systemPrompt`; agregar entidad propia.
