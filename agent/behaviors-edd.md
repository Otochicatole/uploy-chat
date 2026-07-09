# Comportamientos EDD

Esta guia resume los comportamientos globales. Ver `features/` para detalle por pantalla.

## EDD-001 - Entrar por ruta

- Evento: el usuario abre una URL soportada.
- Decision: la ruta construye `initialRoute`; `routeToState` valida si existe el proyecto/chat en el estado disponible.
- Datos: `mode`, `activeProjectId`, `activeChatId`, `projectTab`, `selectedModel`.
- Desenlace: se muestra home, proyecto o conversacion. Si la ruta apunta a un id inexistente, cae a `home`.

## EDD-002 - Bootstrap desde API mock

- Evento: `ChatProvider` monta en cliente.
- Decision: llama `GET /api/chat/state`; si la ruta apunta a proyecto/chat existente, `routeToState` lo activa.
- Datos: `ChatApiData` desde `chat-db.json`.
- Desenlace: la UI se hidrata con proyectos, chats, tabs y modelos del JSON mock.

## EDD-003 - Crear proyecto

- Evento: submit del modal `CreateProjectModal`.
- Decision: llama `POST /api/chat/projects`; nombre vacio devuelve error.
- Datos: se agrega un `ChatProject` al inicio de `projects`.
- Desenlace: `mode = project`, `activeProjectId = nuevo id`, `activeChatId = null`, `projectTab = chat`, ruta `/projects/{projectId}`.

## EDD-004 - Nuevo chat

- Evento: click en `Nuevo chat`.
- Decision: no borra estado existente.
- Datos: `mode = home`, `activeProjectId = null`, `activeChatId = null`, `projectTab = chat`.
- Desenlace: navega a `/` y muestra home con prompt.

## EDD-005 - Seleccionar proyecto

- Evento: click en un proyecto del sidebar.
- Decision: usa el id recibido; el provider no valida explicitamente antes de setear, pero luego la UI depende de `activeProject`.
- Datos: `mode = project`, `activeProjectId`, `activeChatId = null`, `projectTab = chat`.
- Desenlace: navega a `/projects/{projectId}` y muestra workspace de proyecto si existe.

## EDD-006 - Seleccionar chat

- Evento: click en un chat del historial o lista del proyecto.
- Decision: si se pasa `projectId`, construye ruta de chat de proyecto; si no, ruta global.
- Datos: `mode = conversation`, `activeProjectId`, `activeChatId`.
- Desenlace: navega a `/chats/{chatId}` o `/projects/{projectId}/chats/{chatId}`.

## EDD-007 - Enviar mensaje

- Evento: submit de `PromptInput`.
- Decision: llama `POST /api/chat/messages`; si no hay texto ni archivos, el endpoint rechaza. Si hay archivos sin texto, el contenido sera `Files added as context`.
- Datos: crea mensaje de usuario, respuesta asistente completa, attachments y fuentes si esta dentro de proyecto.
- Desenlace: el endpoint escribe `chat-db.json`, devuelve el thread actualizado y la UI navega a la conversacion.

## EDD-008 - Resolver respuesta del asistente mock

- Evento: `POST /api/chat/messages` o `PATCH /api/chat/messages/[messageId]`.
- Decision: el server usa `assistantResponses` del JSON y arma uno o dos bloques segun largo del texto.
- Datos: `ChatMessage` de rol `assistant`.
- Desenlace: la respuesta ya vuelve guardada en el historial.

## EDD-009 - Editar mensaje de usuario

- Evento: submit de tarjeta de edicion en `ConversationWorkspace`.
- Decision: llama `PATCH /api/chat/messages/[messageId]`; contenido vacio devuelve error. Si encuentra el mensaje, corta la conversacion desde ese mensaje.
- Datos: reemplaza el mensaje de usuario, descarta mensajes posteriores y agrega respuesta asistente completa.
- Desenlace: se guarda el thread actualizado en `chat-db.json`.

## EDD-010 - Cambiar tab de proyecto

- Evento: click en `Tabs`.
- Decision: solo tiene efecto util si hay `activeProjectId`.
- Datos: `mode = project`, `activeChatId = null`, `projectTab`.
- Desenlace: navega a `/projects/{id}`, `/sources` o `/system-prompt`.

## EDD-011 - Agregar fuentes al proyecto

- Evento: seleccion de archivos en panel Sources.
- Decision: si no hay archivos o no hay proyecto activo, no cambia estado.
- Datos: `ProjectSource[]` derivado de cada `File`.
- Desenlace: aparecen fuentes en el panel; input file se limpia.

## EDD-012 - Quitar fuente

- Evento: click en icono de borrar de una fuente.
- Decision: si no hay proyecto activo, no cambia estado.
- Datos: filtra `activeProject.sources`.
- Desenlace: la fuente desaparece de la lista.

## EDD-013 - Guardar system prompt

- Evento: submit del formulario de prompt del sistema.
- Decision: draft vacio no guarda.
- Datos: `activeProject.systemPrompt`.
- Desenlace: cambia de modo edicion a lectura si hay prompt guardado.

## EDD-014 - Cambiar modelo

- Evento: click en una opcion de `ModelSelect`.
- Decision: antes de abrir calcula si hay espacio suficiente arriba; si no, abre hacia abajo. Al elegir opcion, llama `PATCH /api/chat/models`; si hay chat activo, tambien lo guarda en ese `ChatThread`.
- Datos: `selectedModel` global y `activeThread.selectedModel` cuando corresponde.
- Desenlace: actualiza el texto del selector y reemplaza `?model=` en la URL actual.

## EDD-015 - Copiar accion visual

- Evento: click en accion `Copy`.
- Decision: no copia al clipboard actualmente; solo cambia estado visual.
- Datos: estado local `hasCopied` en `MessageAction`.
- Desenlace: icono cambia a check por 900 ms.

## EDD-016 - Cambiar modelo desde listado de chats

- Evento: hover sobre una fila de chat y click en el boton de tres puntos.
- Decision: la fecha se oculta durante hover/menu y se muestra un dropdown con `modelOptions` de la API mock. Antes de abrir calcula si hay espacio abajo; si no, abre hacia arriba.
- Datos: `ChatThread.selectedModel`.
- Desenlace: el modelo queda persistido para ese chat; si el chat esta activo, tambien sincroniza `selectedModel` y `?model=`.
