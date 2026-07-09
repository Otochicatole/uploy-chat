# Feature - Prompt input, archivos y modelo

## Archivos

- `src/features/chat/ui/PromptInput/PromptInput.tsx`
- `src/features/chat/ui/ModelSelect/ModelSelect.tsx`
- `src/shared/ui/IconButton/IconButton.tsx`
- Acciones `sendMessage` y `setSelectedModel` en `ChatProvider.tsx`

## Responsabilidad

`PromptInput` captura texto, archivos de contexto y submit. Se usa en home, proyecto y conversacion.

`ModelSelect` permite elegir un modelo mock y sincronizarlo con el query param `model`. Las opciones vienen de `modelOptions` entregado por `GET /api/chat/state` o `GET /api/chat/models`.

## EDD

### Abrir menu de upload

- Evento: click en el boton plus.
- Decision: toggle de `isUploadMenuOpen`.
- Datos: estado local de `PromptInput`.
- Desenlace: aparece menu con opcion `Upload files`.

### Cerrar menu de upload

- Evento: pointer down fuera del formulario o focus del input de texto.
- Decision: si el target no esta dentro de `formRef`, cerrar.
- Datos: `isUploadMenuOpen`.
- Desenlace: menu desaparece.

### Adjuntar archivos

- Evento: seleccion de archivos desde input file oculto.
- Decision: ignora seleccion vacia y deduplica por `name-size-lastModified`.
- Datos: `contextFiles`.
- Desenlace: aparecen chips de archivos y se limpia el input file.

### Quitar archivo adjunto

- Evento: click en X de un chip.
- Decision: filtra por key `name-size-lastModified`.
- Datos: `contextFiles`.
- Desenlace: el chip desaparece.

### Enviar prompt

- Evento: submit del formulario.
- Decision: `canSend` requiere texto o archivos y `!isResponding`.
- Datos: `message`, `contextFiles`, estado global via `sendMessage` y `POST /api/chat/messages`.
- Desenlace: input se limpia, archivos se limpian, se crea/actualiza chat en `chat-db.json`.

### Seleccionar modelo

- Evento: click en opcion de `ModelSelect`.
- Decision: calcula si el dropdown debe abrir hacia arriba o abajo para no quedar recortado. Luego llama `PATCH /api/chat/models`, guarda opcion elegida y cierra menu.
- Datos: `selectedModel`, `ChatThread.selectedModel`.
- Desenlace: selector muestra el modelo y URL actual recibe/reemplaza `?model=`.

## Reglas importantes

- `isResponding` bloquea envio cuando el thread activo tiene un mensaje `loading`.
- Adjuntar archivos no lee contenido. Solo pasa objetos `File` para crear metadata.
- Los modelos reales no vienen de backend real. Las opciones estan centralizadas en `chat-db.json`.
- El dropdown del selector tiene altura maxima y scroll para evitar overflow visual.

## Notas para cambios

- Si se permite subir contenido real, hay que cambiar `ContextAttachment`, `ProjectSource`, el endpoint de sources y la persistencia.
- Si los modelos vienen de un backend real, mantener el contrato de `chat-api.ts` o migrar sus callers juntos.
