# Modelo de estado

## Fuente de verdad

`ChatProvider` mantiene un `ChatState` en React state y expone acciones via Context. Tambien guarda una copia mutable en `stateRef` para que timers y callbacks async no trabajen con closures viejas.

El estado persistente se guarda completo en `localStorage` bajo `uploy-chat-state-v1`.

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

## Persistencia

Lectura:

1. En render inicial se usa `initialChatState` reconciliado con la ruta.
2. En `useEffect`, se lee `localStorage`.
3. Si el JSON es valido y contiene `projects` como array, se usa.
4. Los mensajes `loading` persistidos se convierten en respuestas completas con `settleLoadingMessages`.

Escritura:

- `commitState` actualiza `stateRef`, `useState` y, cuando ya paso bootstrap, `localStorage`.
- Otro `useEffect` tambien escribe cuando cambia `state` despues de bootstrap.

## Identificadores

Los ids se generan con:

```ts
`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
```

No hay ids deterministas ni backend.

## Reglas de truncado

- Titulos: maximo 58 caracteres; si excede, usa primeros 55 + `...`.
- Preview: maximo 86 caracteres; si excede, usa primeros 83 + `...`.

## Archivos mock

`chat.mock.ts` contiene:

- `projectTabs`.
- Opciones de modelo mock antiguas.
- Respuestas lorem.
- `initialChatState` con chats y proyectos precargados.

Nota: `ModelSelect` y el menu de modelo por chat leen sus opciones desde `chat.mock.ts`.
