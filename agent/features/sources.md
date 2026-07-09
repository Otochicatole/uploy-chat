# Feature - Sources

## Archivos

- `src/features/chat/ui/ProjectWorkspace/ProjectWorkspace.tsx`
- Tipo `ProjectSource` en `chat.types.ts`
- Helpers `fileToSource`, `inferFileType`, `formatFileSize` en `src/features/chat/api/server/chat-domain.ts`

## Responsabilidad

Permite agregar y quitar metadata de archivos asociados a un proyecto.

Hay dos formas de sumar fuentes:

- Desde tab `sources`: agrega fuentes directamente al proyecto.
- Desde `PromptInput` dentro de un proyecto: archivos adjuntos al mensaje tambien se agregan como sources del proyecto.

## EDD

### Abrir selector de fuentes

- Evento: click en `Add sources`.
- Decision: dispara click del input file oculto.
- Datos: ninguno.
- Desenlace: el navegador abre selector de archivos.

### Agregar fuentes desde tab

- Evento: input file emite `change`.
- Decision: el cliente serializa metadata de `File[]` y llama `POST /api/chat/projects/[projectId]/sources`.
- Datos: `activeProject.sources`.
- Desenlace: fuentes nuevas se guardan en `chat-db.json` y aparecen al inicio de la lista.

### Agregar fuentes desde mensaje

- Evento: enviar prompt con archivos dentro de proyecto.
- Decision: `POST /api/chat/messages` mapea cada archivo a attachment del mensaje y source del proyecto.
- Datos: `messages[].attachments` y `activeProject.sources`.
- Desenlace: el chat muestra attachments y el proyecto acumula sources.

### Quitar fuente

- Evento: click en trash de una fuente.
- Decision: llama `DELETE /api/chat/projects/[projectId]/sources?sourceId=...`.
- Datos: `activeProject.sources`.
- Desenlace: fuente se borra de `chat-db.json` y desaparece.

## Reglas importantes

- No hay upload real ni lectura de bytes.
- `fileType` se infiere por extension en uppercase.
- `tone` es `red` para PDF y `blue` para el resto desde `fileToSource`.
- El tipo permite `green`, pero el helper actual no lo produce.
- `uploadedAtLabel` se setea como `Ahora` para archivos nuevos.

## Notas para cambios

- Si se implementa backend real, `ProjectSource` necesita id externo, estado de upload y posiblemente URL.
- Si se requiere eliminar attachments ya enviados, eso es otra entidad distinta a `ProjectSource`.
- Si se quiere evitar duplicados en sources, hoy no hay deduplicacion en `addSourcesToActiveProject`.
