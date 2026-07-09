# Feature - Conversaciones

## Archivos

- `src/features/chat/ui/ConversationWorkspace/ConversationWorkspace.tsx`
- `src/features/chat/ui/ChatList/ChatList.tsx`
- `src/features/chat/ui/ChatRow/ChatRow.tsx`
- `src/features/chat/model/ChatProvider.tsx`
- `src/features/chat/model/chat.types.ts`

## Responsabilidad

Muestra mensajes del thread activo, permite editar mensajes de usuario y presenta acciones visuales sobre mensajes.

Los mensajes de usuario usan `content`. Los mensajes del asistente usan `blocks`.

## EDD

### Mostrar conversacion

- Evento: `mode = conversation` y existe `activeThread`.
- Decision: `ChatWorkspace` renderiza `ConversationWorkspace`.
- Datos: `activeThread.messages`.
- Desenlace: se listan mensajes y queda un `PromptInput` al fondo.

### Mostrar loading del asistente

- Evento: un mensaje tiene `status = loading`.
- Decision: `AssistantMessage` no renderiza texto. Hoy la API mock devuelve respuestas completas, asi que este estado queda como soporte visual legacy.
- Datos: `ChatMessage.status`.
- Desenlace: aparece punto con gradiente y animacion pulse.

### Expandir/colapsar respuesta

- Evento: click en etiqueta `createdAtLabel` de asistente.
- Decision: solo alterna si hay mas de un block.
- Datos: estado local `isExpanded`.
- Desenlace: muestra todos los blocks o solo el primero.

### Editar mensaje de usuario

- Evento: click en accion de lapiz del mensaje de usuario.
- Decision: setea `editingMessageId` y copia contenido a `draft`.
- Datos: estado local de `ConversationWorkspace`.
- Desenlace: se muestra formulario de edicion arriba de la lista.

### Guardar edicion

- Evento: submit del formulario de edicion.
- Decision: `editUserMessage` llama `PATCH /api/chat/messages/[messageId]`; el endpoint rechaza contenido vacio y solo modifica mensajes `role = user`.
- Datos: thread afectado.
- Desenlace: reemplaza el mensaje, elimina mensajes posteriores, agrega respuesta mock completa y guarda el JSON.

### Copiar visual

- Evento: click en accion Copy.
- Decision: solo cambia UI local; no usa Clipboard API.
- Datos: `hasCopied`.
- Desenlace: icono cambia a check por 900 ms.

## Reglas importantes

- Editar un mensaje corta la conversacion desde ese punto. Esto simula regeneracion de rama.
- Las acciones `Edit response` y `Branch` son visuales; no tienen efecto de dominio hoy.
- `ChatList` y `ChatRow` son usados en el panel de proyecto para listar chats.
- Al entrar a un chat, `selectedModel` se sincroniza con `ChatThread.selectedModel` si existe.

## Notas para cambios

- Para implementar copiar real, usar `navigator.clipboard.writeText` y decidir que texto copiar para asistente con multiples `blocks`.
- Para branching real, se necesita modelar ramas en `ChatThread`.
- Para editar respuestas del asistente, agregar endpoint de dominio/API y accion en `ChatProvider`.
