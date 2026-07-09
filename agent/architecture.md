# Arquitectura

## Capas

El proyecto esta organizado en tres zonas:

- `src/app`: rutas Next.js y layout raiz.
- `src/features/chat`: feature principal de chat, proyectos, conversaciones, fuentes y prompt del sistema.
- `src/shared/ui`: componentes visuales reutilizables pequenos.

La feature `chat` contiene API mock, modelo y componentes de UI:

```text
src/features/chat
  api/
    client/
      chat-api.ts
    db/
      chat-db.json
    server/
      api-response.ts
      chat-db.ts
      chat-domain.ts
  index.ts
  model/
    ChatProvider.tsx
    chat.types.ts
  ui/
    ChatPage/
    ChatWorkspace/
    ConversationWorkspace/
    ProjectWorkspace/
    PromptInput/
    Sidebar/
    ...
```

## Rutas

Las rutas de pagina renderizan `ChatPage` y pasan un `initialRoute`:

- `/`: modo `home`.
- `/chats/[chatId]`: modo `conversation` global.
- `/projects/[projectId]`: modo `project`, tab `chat`.
- `/projects/[projectId]/chats/[chatId]`: modo `conversation` dentro de proyecto.
- `/projects/[projectId]/sources`: modo `project`, tab `sources`.
- `/projects/[projectId]/system-prompt`: modo `project`, tab `system-prompt`.

Tambien leen `searchParams.model` y lo pasan como `selectedModel` inicial.

Los route handlers de API estan en `/api/chat/*`:

- `GET /api/chat/state`: bootstrap completo.
- `GET/PATCH /api/chat/models`: modelos y seleccion de modelo.
- `GET/POST /api/chat/projects`: listado y creacion de proyectos.
- `GET/PATCH /api/chat/projects/[projectId]`: contenido de proyecto y system prompt.
- `POST/DELETE /api/chat/projects/[projectId]/sources`: fuentes de proyecto.
- `GET /api/chat/chats/[chatId]`: contenido de chat.
- `POST /api/chat/messages`: enviar mensaje y guardar respuesta mock.
- `PATCH /api/chat/messages/[messageId]`: editar mensaje de usuario y regenerar respuesta mock.

## Limite server/client

Los archivos de `src/app/**/page.tsx` son server components async. Solo resuelven `params` y `searchParams`.

La UI interactiva empieza en `ChatPage`, que monta `ChatProvider`, `Sidebar` y `ChatWorkspace`. Los componentes con estado o eventos tienen `"use client"`.

## Flujo de render principal

1. Una ruta Next.js construye `initialRoute`.
2. `ChatPage` monta `ChatProvider`.
3. `ChatProvider` inicia desde la cache en memoria de `chat-api.ts` si existe; si no, usa estado vacio/fallback respetando la ruta.
4. En un efecto client-side, llama `GET /api/chat/state`.
5. La respuesta se cachea en memoria y se reconcilia con la ruta actual usando `routeToState`.
6. `Sidebar` muestra proyectos e historial del contexto activo.
7. `ChatWorkspace` elige vista por `mode`: home, project o conversation.

## Layout y tema

El layout raiz usa `IBM_Plex_Sans` desde `next/font/google`, idioma `es` y clases globales de altura/flex.

El tema visual esta definido en `src/app/globals.css` con tokens Tailwind:

- Fondo: `uploy-bg`.
- Superficies: `uploy-surface`, `uploy-tertiary`.
- Bordes: `uploy-line`.
- Texto: `uploy-primary`, `uploy-secondary`, `uploy-muted`.
- Acento: `uploy-accent`.

## Puntos de entrada activos

- Export publico de la feature: `src/features/chat/index.ts`.
- Pagina funcional: `src/features/chat/ui/ChatPage/ChatPage.tsx`.
- Estado global cliente: `src/features/chat/model/ChatProvider.tsx`.
- DB mock: `src/features/chat/api/db/chat-db.json`.
- Dominio server: `src/features/chat/api/server/chat-domain.ts`.

## Dependencias externas relevantes

- `next/navigation`: usado por `useRouter` para cambiar URL desde acciones del provider.
- `lucide-react`: iconos visuales.
- Tailwind: clases utilitarias, sin CSS modules.
