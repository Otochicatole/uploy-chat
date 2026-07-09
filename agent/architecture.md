# Arquitectura

## Capas

El proyecto esta organizado en tres zonas:

- `src/app`: rutas Next.js y layout raiz.
- `src/features/chat`: feature principal de chat, proyectos, conversaciones, fuentes y prompt del sistema.
- `src/shared/ui`: componentes visuales reutilizables pequenos.

La feature `chat` contiene su propio modelo, mocks y componentes de UI:

```text
src/features/chat
  index.ts
  model/
    ChatProvider.tsx
    chat.mock.ts
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

Todas las rutas renderizan `ChatPage` y pasan un `initialRoute`:

- `/`: modo `home`.
- `/chats/[chatId]`: modo `conversation` global.
- `/projects/[projectId]`: modo `project`, tab `chat`.
- `/projects/[projectId]/chats/[chatId]`: modo `conversation` dentro de proyecto.
- `/projects/[projectId]/sources`: modo `project`, tab `sources`.
- `/projects/[projectId]/system-prompt`: modo `project`, tab `system-prompt`.

Tambien leen `searchParams.model` y lo pasan como `selectedModel` inicial.

## Limite server/client

Los archivos de `src/app/**/page.tsx` son server components async. Solo resuelven `params` y `searchParams`.

La UI interactiva empieza en `ChatPage`, que monta `ChatProvider`, `Sidebar` y `ChatWorkspace`. Los componentes con estado o eventos tienen `"use client"`.

## Flujo de render principal

1. Una ruta Next.js construye `initialRoute`.
2. `ChatPage` monta `ChatProvider`.
3. `ChatProvider` aplica `routeToState(initialChatState, initialRoute)` como estado inicial.
4. En un efecto client-side, intenta leer `localStorage`.
5. Si hay estado persistido valido, lo reconcilia con la ruta actual.
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
- Estado global: `src/features/chat/model/ChatProvider.tsx`.

## Dependencias externas relevantes

- `next/navigation`: usado por `useRouter` para cambiar URL desde acciones del provider.
- `lucide-react`: iconos visuales.
- Tailwind: clases utilitarias, sin CSS modules.
