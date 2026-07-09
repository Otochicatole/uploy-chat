# Feature - Sidebar y navegacion

## Archivos

- `src/features/chat/ui/Sidebar/Sidebar.tsx`
- `src/features/chat/ui/SidebarGroup/SidebarGroup.tsx`
- `src/features/chat/ui/SidebarItem/SidebarItem.tsx`
- `src/features/chat/ui/CreateProjectModal/CreateProjectModal.tsx`
- Acciones en `src/features/chat/model/ChatProvider.tsx`

## Responsabilidad

El sidebar permite:

- iniciar nuevo chat;
- abrir modal para crear proyecto;
- navegar entre proyectos;
- navegar por historial de chats del contexto actual.

El historial cambia segun contexto:

- En proyecto activo, `sidebarHistory = activeProject.chats`.
- Fuera de proyecto, `sidebarHistory = globalChats`.

## EDD

### Nuevo chat

- Evento: click en `Nuevo chat`.
- Decision: resetear seleccion activa, pero conservar proyectos y chats.
- Datos: `mode`, `activeProjectId`, `activeChatId`, `projectTab`.
- Desenlace: navega a `/`.

### Abrir modal de proyecto

- Evento: click en `New project`.
- Decision: set local `isCreateProjectOpen = true`.
- Datos: estado local de `Sidebar`.
- Desenlace: aparece `CreateProjectModal`.

### Crear proyecto

- Evento: submit del modal.
- Decision: el boton esta disabled si `name.trim()` esta vacio; si hay nombre, llama `POST /api/chat/projects`.
- Datos: nuevo `ChatProject` al inicio de `projects`.
- Desenlace: el JSON se actualiza, modal cierra y ruta cambia a `/projects/{id}`.

### Seleccionar proyecto

- Evento: click en item de `PROJECTS`.
- Decision: llamar `selectProject(project.id)` y refrescar detalle con `GET /api/chat/projects/[projectId]`.
- Datos: `activeProjectId`.
- Desenlace: item queda activo mientras `mode !== home`.

### Seleccionar historial

- Evento: click en item de `CHAT HISTORY`.
- Decision: busca el chat en `sidebarHistory` para recuperar `projectId` si existe.
- Datos: `activeChatId`, `activeProjectId`.
- Desenlace: abre ruta global o de proyecto.

## Notas para cambios

- Si se agregan filtros o busqueda de historial, mantener `sidebarHistory` como fuente derivada.
- Si se quiere historial global siempre visible, hay que cambiar la decision actual de contexto.
- El modal no maneja `Escape`; si se agrega, hacerlo con un efecto local en `CreateProjectModal`.
