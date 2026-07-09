# Notas de mantenimiento

## Estado actual del producto

El proyecto es un prototipo con API mock local. Hay route handlers de Next que escriben un JSON como DB. No hay:

- Server actions.
- Base de datos real.
- Autenticacion.
- Upload real de archivos.
- Integracion real con modelos IA.
- Tests.

## Deuda o artefactos a no sobreinterpretar

- `src/config/chat-content.ts` y `src/config/chat-navigation.ts` no aparecen importados por la app actual.
- `DropdownMenu` existe pero no parece usado.
- `src/features/chat/api/db/chat-db.json` es la unica fuente activa de datos mock.
- Varias etiquetas son placeholder o lorem.
- Acciones de copiar, editar respuesta y branch son visuales o incompletas.
- El menu de `ChatHeader` funciona como selector de modelos para el contexto actual del proyecto.

## Riesgos tecnicos

- `chat-db.json` se escribe desde route handlers con `fs`; esto es para desarrollo/local, no para hosting serverless read-only.
- No hay migracion de schema para el JSON DB.
- Los archivos seleccionados se serializan como metadata; no se suben bytes ni contenido real.
- La UI no tiene manejo visible de errores; los errores de API se loguean en consola.

## Guia para reemplazar la API mock por backend real

1. Mantener la interfaz de `src/features/chat/api/client/chat-api.ts`.
2. Reemplazar route handlers o hacer que llamen a servicios reales.
3. Separar entidades persistidas de labels visuales (`createdAtLabel`, `updatedAtLabel`).
4. Reemplazar `assistantResponses` por respuesta real.
5. Definir ids de servidor y estrategia de reconciliacion local.
6. Agregar manejo de errores por thread/mensaje.

## Guia para tests futuros

Prioridad sugerida:

1. Unit tests para `chat-domain.ts`: crear proyecto, enviar mensaje, editar, modelos, sources.
2. Tests de route handlers para contratos JSON.
3. Tests de interaccion para `PromptInput`, `CreateProjectModal`, `SystemPromptPanel`.
4. Tests e2e para rutas principales y persistencia en JSON.

## Convenciones al modificar

- Mantener comportamiento de dominio de persistencia en `src/features/chat/api/server/chat-domain.ts`.
- Mantener componentes UI lo mas presentacionales posible.
- Actualizar `agent/` cuando cambie una feature relevante.
- Si se cambia la forma de estado persistido, documentar migracion.
