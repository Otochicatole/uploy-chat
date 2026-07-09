# Feature - Routing y layout

## Archivos

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/chats/[chatId]/page.tsx`
- `src/app/projects/[projectId]/page.tsx`
- `src/app/projects/[projectId]/chats/[chatId]/page.tsx`
- `src/app/projects/[projectId]/sources/page.tsx`
- `src/app/projects/[projectId]/system-prompt/page.tsx`
- `src/features/chat/ui/ChatPage/ChatPage.tsx`
- `src/features/chat/ui/ChatWorkspace/ChatWorkspace.tsx`

## Responsabilidad

Esta feature conecta URLs con el estado inicial del chat. Las paginas de Next no implementan UI propia; solo traducen parametros a `initialRoute`.

`ChatPage` crea el shell principal:

- `ChatProvider`
- `Sidebar`
- `ChatWorkspace`

`ChatWorkspace` renderiza una de tres vistas segun `mode`:

- `home`: headline y `PromptInput`.
- `project`: `ProjectWorkspace`.
- `conversation`: `ConversationWorkspace`.

## EDD

### Abrir home

- Evento: usuario navega a `/`.
- Decision: `mode = home`; si hay `?model=`, se pasa como modelo inicial.
- Datos: `initialRoute.selectedModel`.
- Desenlace: se muestra pantalla de inicio con prompt.

### Abrir chat global

- Evento: usuario navega a `/chats/[chatId]`.
- Decision: `activeProjectId = null`; `ChatProvider` busca el chat en `globalChats` y luego en proyectos como fallback.
- Datos: `activeChatId`.
- Desenlace: si existe, se muestra conversacion; si no, cae a home.

### Abrir proyecto

- Evento: usuario navega a `/projects/[projectId]`.
- Decision: tab inicial `chat`.
- Datos: `activeProjectId`, `projectTab`.
- Desenlace: se muestra workspace de proyecto y sus chats.

### Abrir tab de proyecto

- Evento: usuario navega a `/projects/[projectId]/sources` o `/system-prompt`.
- Decision: tab inicial segun URL.
- Datos: `projectTab`.
- Desenlace: se muestra Sources o System prompt.

## Notas para cambios

- Para agregar una ruta nueva, crear `src/app/.../page.tsx` que renderice `ChatPage` con un `initialRoute` compatible.
- Si se agrega un nuevo `WorkspaceMode`, actualizar `chat.types.ts`, `routeToState` y `ChatWorkspace`.
- La grilla principal asume sidebar fijo de 260 px.
