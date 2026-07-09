# Feature - Prompt input, archivos y modelo

## Archivos

- `src/features/chat/ui/PromptInput/PromptInput.tsx`
- `src/features/chat/ui/ModelSelect/ModelSelect.tsx`
- `src/shared/ui/IconButton/IconButton.tsx`
- Acciones `sendMessage` y `setSelectedModel` en `ChatProvider.tsx`

## Responsabilidad

`PromptInput` captura texto, archivos de contexto y submit. Se usa en home, proyecto y conversacion.

`ModelSelect` permite elegir un modelo mock y sincronizarlo con el query param `model`. Las opciones vienen de `modelOptions` en `chat.mock.ts`.

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
- Datos: `message`, `contextFiles`, estado global via `sendMessage`.
- Desenlace: input se limpia, archivos se limpian, se crea/actualiza chat.

### Seleccionar modelo

- Evento: click en opcion de `ModelSelect`.
- Decision: calcula si el dropdown debe abrir hacia arriba o abajo para no quedar recortado. Luego guarda opcion elegida, cierra menu y si hay chat activo actualiza el modelo del thread.
- Datos: `selectedModel`, `ChatThread.selectedModel`.
- Desenlace: selector muestra el modelo y URL actual recibe/reemplaza `?model=`.

## Reglas importantes

- `isResponding` bloquea envio cuando el thread activo tiene un mensaje `loading`.
- Adjuntar archivos no lee contenido. Solo pasa objetos `File` para crear metadata.
- Los modelos reales no vienen de backend. Las opciones estan centralizadas en el mock principal.
- El dropdown del selector tiene altura maxima y scroll para evitar overflow visual.

## Notas para cambios

- Si se agrega backend, `sendMessage` deberia ser async o delegar a una capa de servicio.
- Si se permite subir contenido real, hay que cambiar `ContextAttachment`, `ProjectSource` y persistencia.
- Si los modelos vienen de config, unificar `ModelSelect` con `chat.mock.ts` o una nueva fuente de dominio.
