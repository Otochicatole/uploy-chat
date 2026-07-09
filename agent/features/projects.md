# Feature - Proyectos

## Archivos

- `src/features/chat/ui/ProjectWorkspace/ProjectWorkspace.tsx`
- `src/features/chat/ui/ChatHeader/ChatHeader.tsx`
- `src/features/chat/ui/Tabs/Tabs.tsx`
- `src/features/chat/ui/CreateProjectModal/CreateProjectModal.tsx`
- Acciones de proyecto en `ChatProvider.tsx` y endpoints `/api/chat/projects*`

## Responsabilidad

Agrupa conversaciones, fuentes y system prompt bajo un proyecto. El workspace de proyecto tiene tres tabs:

- `chat`
- `sources`
- `system-prompt`

## EDD

### Crear proyecto

- Evento: `CreateProjectModal` envia nombre.
- Decision: llama `POST /api/chat/projects`; nombre vacio no se acepta.
- Datos: `projects`.
- Desenlace: proyecto nuevo se guarda en `chat-db.json`, aparece primero y queda activo.

### Entrar al workspace de proyecto

- Evento: ruta de proyecto o click en sidebar.
- Decision: `selectProject` usa tab `chat` por defecto.
- Datos: `activeProjectId`, `projectTab`.
- Desenlace: header muestra nombre del proyecto y tabs.

### Listar chats de proyecto

- Evento: tab `chat` activa.
- Decision: si `activeProject.chats.length === 0`, mostrar empty state.
- Datos: `activeProject.chats`.
- Desenlace: lista con `ChatList` o texto "There are no chats yet".

### Cambiar modelo desde una fila

- Evento: hover sobre un chat y click en tres puntos.
- Decision: reemplaza visualmente la fecha por el boton de acciones y abre un dropdown con modelos de la API mock. El menu calcula si debe abrir hacia abajo o hacia arriba segun el espacio disponible en viewport.
- Datos: `ChatThread.selectedModel`.
- Desenlace: el chat queda asociado al modelo elegido.

### Enviar mensaje desde proyecto

- Evento: submit de `PromptInput` mientras `activeProjectId` existe y `mode !== home`.
- Decision: `POST /api/chat/messages` guarda el thread dentro del proyecto activo.
- Datos: `activeProject.chats`, `activeProject.sources` si hay archivos.
- Desenlace: crea/actualiza chat de proyecto y navega a `/projects/{projectId}/chats/{chatId}`.

### Menu de header

- Evento: click en boton more del header.
- Decision: abre un dropdown con `modelOptions` de la API mock y calcula si debe abrir hacia abajo o hacia arriba segun el espacio disponible.
- Datos: estado local `isMenuOpen`, `selectedModel`.
- Desenlace: al elegir modelo actualiza el modelo global activo y cierra el menu.

## Reglas importantes

- Un proyecto nuevo empieza sin chats, sin sources y con `systemPrompt = ""`.
- Al seleccionar proyecto desde sidebar se sale de una conversacion activa.
- Los chats de proyecto llevan `projectId`.
- Los chats pueden llevar `selectedModel`; si no lo tienen, usan el modelo global actual como fallback.
- El menu de modelo por fila tiene altura maxima y scroll para evitar que quede cortado.
- El menu de tres puntos del header tambien muestra modelos de la API mock y actualiza el selector del input.

## Notas para cambios

- Si se agregan acciones extra al menu de proyecto, separarlas del selector de modelos o crear secciones claras.
- Si se permite renombrar proyecto, actualizar header, sidebar y persistencia.
- Si se agrega borrado de proyecto, decidir que pasa con la ruta activa.
