# Feature - API mock y DB JSON

## Archivos

- `src/features/chat/api/db/chat-db.json`
- `src/features/chat/api/server/chat-db.ts`
- `src/features/chat/api/server/chat-domain.ts`
- `src/features/chat/api/server/api-response.ts`
- `src/features/chat/api/client/chat-api.ts`
- `src/app/api/chat/**/route.ts`

## Responsabilidad

Simula una API usando route handlers de Next. La DB es un archivo JSON local y mutable. Los endpoints leen/modifican ese JSON y devuelven payloads que `ChatProvider` aplica al estado cliente. `chat-api.ts` guarda en memoria el ultimo `ChatApiData` para evitar parpadeos al navegar entre rutas internas.

## Endpoints

- `GET /api/chat/state`: devuelve `ChatApiData` completo para bootstrap.
- `GET /api/chat/models`: devuelve `defaultModel`, `modelOptions` y `selectedModel`.
- `PATCH /api/chat/models`: cambia modelo global y opcionalmente modelo de un chat.
- `GET /api/chat/projects`: devuelve listado resumido de proyectos.
- `POST /api/chat/projects`: crea proyecto.
- `GET /api/chat/projects/[projectId]`: devuelve proyecto completo con sources, system prompt e historial.
- `PATCH /api/chat/projects/[projectId]`: guarda system prompt.
- `POST /api/chat/projects/[projectId]/sources`: agrega fuentes desde metadata de archivos.
- `DELETE /api/chat/projects/[projectId]/sources?sourceId=...`: borra fuente.
- `GET /api/chat/chats/[chatId]?projectId=...`: devuelve un chat.
- `POST /api/chat/messages`: agrega mensaje de usuario, genera respuesta mock y guarda historial.
- `PATCH /api/chat/messages/[messageId]`: edita mensaje de usuario, corta historial posterior y genera respuesta mock.

## EDD

### Leer DB

- Evento: llega request GET.
- Decision: `readChatDb` lee `chat-db.json`.
- Datos: JSON completo.
- Desenlace: route handler devuelve un JSON derivado.

### Cachear respuesta cliente

- Evento: `chat-api.ts` recibe un payload que extiende `ChatApiData`.
- Decision: guarda ese payload en una variable de modulo.
- Datos: ultimo estado API completo.
- Desenlace: si `ChatProvider` se remonta durante navegacion interna, arranca desde cache en memoria mientras refresca `/api/chat/state`.

### Mutar DB

- Evento: llega request POST/PATCH/DELETE.
- Decision: `mutateChatDb` encola la operacion, lee DB, ejecuta funcion de dominio y escribe el archivo.
- Datos: `ChatDatabase`.
- Desenlace: `chat-db.json` queda actualizado y el endpoint responde con estado/proyecto/thread actualizado.

### Enviar mensaje

- Evento: `POST /api/chat/messages`.
- Decision: si hay proyecto, guarda el thread dentro del proyecto; si no, en `globalChats`. Si no hay `chatId`, crea uno.
- Datos: mensaje de usuario, attachments serializados, sources y respuesta mock.
- Desenlace: el historial queda guardado con user message + assistant message.

## Reglas importantes

- No se guardan archivos reales; solo metadata serializada desde `File`.
- `assistantResponses` vive en el JSON y se usa para generar bloques de respuesta.
- La API usa `runtime = "nodejs"` porque escribe en filesystem.
- Esta persistencia no es adecuada para serverless read-only ni ejecuciones concurrentes reales.
- La cache cliente no reemplaza al JSON ni sobrevive reload; solo evita flicker de UI entre rutas.
