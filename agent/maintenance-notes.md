# Notas de mantenimiento

## Estado actual del producto

El proyecto es un prototipo front-end persistido en navegador. No hay:

- API routes.
- Server actions.
- Base de datos.
- Autenticacion.
- Upload real de archivos.
- Integracion real con modelos IA.
- Tests.

## Deuda o artefactos a no sobreinterpretar

- `src/config/chat-content.ts` y `src/config/chat-navigation.ts` no aparecen importados por la app actual.
- `DropdownMenu` existe pero no parece usado.
- `chat.mock.ts` centraliza `modelOptions`; mantener ahi cualquier cambio de modelos mock.
- Varias etiquetas son placeholder o lorem.
- Acciones de copiar, editar respuesta y branch son visuales o incompletas.
- El menu de `ChatHeader` funciona como selector de modelos para el contexto actual del proyecto.

## Riesgos tecnicos

- `sendMessage` captura `state.activeProjectId`, `state.activeChatId` y `state.mode` desde render; `commitState` protege escritura, pero el destino del mensaje se calcula antes del updater.
- `setProjectTab` usa `state.activeProjectId` externo al updater para navegar.
- La persistencia guarda todo el estado, incluyendo mocks y labels visuales.
- No hay migracion de schema para `localStorage`.
- Los archivos seleccionados no son persistibles como `File`; solo se persiste metadata despues de convertirlos a attachments/sources.
- Timers de respuestas mock se limpian en unmount, pero no se remueven de `timersRef` al completarse.

## Guia para agregar backend

1. Crear una capa de servicio fuera de UI, por ejemplo `src/features/chat/api`.
2. Convertir `sendMessage` en flujo async o action state con estados `loading/error/complete`.
3. Separar entidades persistidas de labels visuales (`createdAtLabel`, `updatedAtLabel`).
4. Reemplazar `loremResponse` por respuesta real.
5. Definir ids de servidor y estrategia de reconciliacion local.
6. Agregar manejo de errores por thread/mensaje.

## Guia para tests futuros

Prioridad sugerida:

1. Unit tests para helpers de `ChatProvider`: title, preview, routeToState, file type.
2. Tests de reducer si el provider se refactoriza a reducer.
3. Tests de interaccion para `PromptInput`, `CreateProjectModal`, `SystemPromptPanel`.
4. Tests e2e para rutas principales y persistencia.

## Convenciones al modificar

- Mantener comportamiento de dominio en `ChatProvider`.
- Mantener componentes UI lo mas presentacionales posible.
- Actualizar `agent/` cuando cambie una feature relevante.
- Si se cambia la forma de estado persistido, documentar migracion.
