# Comportamientos EDD

Esta guia resume los comportamientos globales. Ver `features/` para detalle por pantalla.

## EDD-001 - Entrar por ruta

- Evento: el usuario abre una URL soportada.
- Decision: la ruta construye `initialRoute`; `routeToState` valida si existe el proyecto/chat en el estado disponible.
- Datos: `mode`, `activeProjectId`, `activeChatId`, `projectTab`, `selectedModel`.
- Desenlace: se muestra home, proyecto o conversacion. Si la ruta apunta a un id inexistente, cae a `home`.

## EDD-002 - Bootstrap desde localStorage

- Evento: `ChatProvider` monta en cliente.
- Decision: si `localStorage` contiene JSON valido con `projects` array, se usa; si no, se usa `initialChatState`.
- Datos: estado completo `ChatState`.
- Desenlace: la UI puede cambiar despues del primer tick para reflejar estado persistido.

## EDD-003 - Crear proyecto

- Evento: submit del modal `CreateProjectModal`.
- Decision: nombre vacio no crea; nombre con texto se trimea.
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
- Decision: si no hay texto ni archivos, no hace nada. Si hay archivos sin texto, el contenido sera `Files added as context`.
- Datos: crea mensaje de usuario, mensaje asistente `loading`, attachments y fuentes si esta dentro de proyecto.
- Desenlace: crea o actualiza chat, navega a la conversacion y agenda respuesta mock a 950 ms.

## EDD-008 - Resolver respuesta del asistente

- Evento: timer iniciado por `queueAssistantResponse`.
- Decision: busca cualquier mensaje con id `loadingMessageId` en todos los threads.
- Datos: reemplaza el mensaje `loading` por un mensaje de asistente completo.
- Desenlace: desaparece el pulso de carga y aparece contenido lorem.

## EDD-009 - Editar mensaje de usuario

- Evento: submit de tarjeta de edicion en `ConversationWorkspace`.
- Decision: contenido vacio no edita. Si encuentra el mensaje, corta la conversacion desde ese mensaje.
- Datos: reemplaza el mensaje de usuario, descarta mensajes posteriores y agrega un nuevo asistente `loading`.
- Desenlace: se regenera respuesta mock con timer.

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
- Decision: antes de abrir calcula si hay espacio suficiente arriba; si no, abre hacia abajo. Al elegir opcion, guarda cualquier string recibido; si hay chat activo, tambien lo guarda en ese `ChatThread`.
- Datos: `selectedModel` global y `activeThread.selectedModel` cuando corresponde.
- Desenlace: actualiza el texto del selector y reemplaza `?model=` en la URL actual.

## EDD-015 - Copiar accion visual

- Evento: click en accion `Copy`.
- Decision: no copia al clipboard actualmente; solo cambia estado visual.
- Datos: estado local `hasCopied` en `MessageAction`.
- Desenlace: icono cambia a check por 900 ms.

## EDD-016 - Cambiar modelo desde listado de chats

- Evento: hover sobre una fila de chat y click en el boton de tres puntos.
- Decision: la fecha se oculta durante hover/menu y se muestra un dropdown con `modelOptions` del mock principal. Antes de abrir calcula si hay espacio abajo; si no, abre hacia arriba.
- Datos: `ChatThread.selectedModel`.
- Desenlace: el modelo queda persistido para ese chat; si el chat esta activo, tambien sincroniza `selectedModel` y `?model=`.
