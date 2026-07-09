# Modelo de estado

## Fuente de verdad

`ChatProvider` mantiene un `ChatState` en React state y expone acciones via Context. Tambien guarda una copia mutable en `stateRef` para que callbacks async no trabajen con closures viejas.

La fuente persistente es `src/features/chat/api/db/chat-db.json`. Los route handlers leen y escriben ese archivo mediante `src/features/chat/api/server/chat-db.ts`.

El cliente mantiene una cache en memoria del ultimo `ChatApiData` dentro de `src/features/chat/api/client/chat-api.ts`. Esa cache no persiste entre reloads; solo evita parpadeos cuando Next remonta `ChatProvider` durante navegacion interna.

## Entidades principales

### ChatState

Campos:

- `mode`: `home`, `project` o `conversation`.
- `activeProjectId`: proyecto activo o `null`.
- `activeChatId`: chat activo o `null`.
- `projectTab`: tab activa dentro de proyecto.
- `selectedModel`: modelo elegido.
- `projects`: lista de proyectos.
- `globalChats`: chats fuera de proyecto.

### ChatProject

Representa un workspace de proyecto:

- `id`
- `name`
- `chats`
- `sources`
- `systemPrompt`

### ChatThread

Representa una conversacion:

- `id`
- `title`
- `preview`
- `updatedAtLabel`
- `selectedModel`
- `projectId` opcional
- `messages`

Si `projectId` existe, el chat pertenece a `ChatProject.chats`. Si no existe, pertenece a `globalChats`.

### ChatMessage

Representa un mensaje:

- `role`: `user` o `assistant`.
- `content`: usado por mensajes de usuario.
- `blocks`: usado por respuestas de asistente.
- `attachments`: metadata de archivos adjuntos al prompt.
- `status`: `complete` o `loading`.
- `createdAtLabel`: etiqueta visual.

### ProjectSource

Representa una fuente agregada a un proyecto:

- `id`
- `name`
- `fileType`
- `uploadedAtLabel`
- `tone`: `blue`, `red` o `green`.

Hoy no guarda contenido real del archivo, solo metadata.

## Estado derivado expuesto por Context

`ChatProvider` calcula:

- `activeProject`: proyecto activo completo.
- `activeThread`: conversacion activa global o de proyecto.
- `sidebarHistory`: chats del proyecto activo o `globalChats`.
- `isResponding`: true si `activeThread` tiene mensajes `loading`.
- `modelOptions`, `projectTabs` y `defaultModel`: vienen del bootstrap de la API mock.

## Persistencia

Lectura:

1. En render inicial se usa la cache en memoria si existe; si no, estado vacio/fallback reconciliado con la ruta.
2. En `useEffect`, el cliente llama `GET /api/chat/state`.
3. El route handler lee `chat-db.json`.
4. `chat-api.ts` actualiza la cache en memoria.
5. `ChatProvider` aplica `routeToState` con la data recibida.

Escritura:

- Las mutaciones del usuario llaman endpoints API mock.
- Los endpoints usan `mutateChatDb` para leer, modificar y escribir `chat-db.json`.
- `chat-api.ts` actualiza la cache en memoria con la respuesta.
- `ChatProvider` aplica la respuesta del endpoint al estado local.

## Identificadores

Los ids se generan con:

```ts
`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
```

No hay ids deterministas ni base real; los ids se generan en la capa mock server.

## Reglas de truncado

- Titulos: maximo 58 caracteres; si excede, usa primeros 55 + `...`.
- Preview: maximo 86 caracteres; si excede, usa primeros 83 + `...`.

## Archivos mock/API

La fuente activa es `src/features/chat/api/db/chat-db.json`. Contiene:

- `projectTabs`
- `modelOptions`
- `assistantResponses`
- `selectedModel`
- `projects`
- `globalChats`

No debe existir otro mock paralelo para estos datos; `chat-db.json` es la fuente activa.
