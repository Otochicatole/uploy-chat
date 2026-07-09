# Uploy Chat - Guia para agentes IA

Esta carpeta documenta el proyecto para que otra IA pueda entenderlo y modificarlo sin tener que redescubrir la arquitectura desde cero.

## Resumen

Uploy Chat es una app Next.js con App Router que simula un workspace de chat con proyectos. Usa route handlers bajo `/api/chat/*` como API mock y persiste la data en `src/features/chat/api/db/chat-db.json`.

La fuente principal de UI/orquestacion es `src/features/chat/model/ChatProvider.tsx`. La logica server de la API mock vive en `src/features/chat/api/server`. La fuente persistente de datos mock es `src/features/chat/api/db/chat-db.json`.

## Stack

- Next.js 16 con App Router.
- React 19.
- TypeScript estricto.
- Tailwind CSS v4.
- `lucide-react` para iconos.
- Estado client-side con React Context.
- Persistencia mock server-side escribiendo un JSON local.

## Como leer esta carpeta

- `architecture.md`: mapa del proyecto, rutas y limites server/client.
- `state-model.md`: entidades, relaciones y persistencia.
- `features/mock-api.md`: endpoints disponibles y flujo de escritura del JSON.
- `behaviors-edd.md`: comportamientos globales usando EDD.
- `features/`: detalle por feature funcional.
- `maintenance-notes.md`: deuda, riesgos y recomendaciones para futuras IAs.

## Convencion EDD usada aca

En estos documentos, EDD significa documentacion orientada a eventos:

- Evento: accion del usuario, ruta o efecto async que inicia el flujo.
- Decision: reglas y bifurcaciones del dominio/UI.
- Datos: estado leido o modificado.
- Desenlace: efecto observable en UI, ruta, persistencia o respuesta API.

Si el equipo usa otra definicion de EDD, mantener la intencion: describir comportamiento desde el evento hasta el cambio visible.

## Reglas para otra IA

1. Antes de cambiar comportamiento, leer `ChatProvider.tsx` y la capa server en `src/features/chat/api/server`.
2. No asumir backend real. Los mensajes, fuentes, proyectos y respuestas se guardan en el JSON mock.
3. No tomar `src/config/chat-content.ts` ni `src/config/chat-navigation.ts` como fuente activa; hoy parecen artefactos legacy no importados.
4. Las rutas de `src/app/**/page.tsx` no contienen UI propia; solo construyen `initialRoute` y renderizan `ChatPage`.
5. Si se agrega una feature persistente, actualizar tipos en `chat.types.ts`, endpoint/API server, cliente API, accion en `ChatProvider.tsx` y UI correspondiente.
6. Si una accion debe sobrevivir reload, debe pasar por un endpoint que modifique `chat-db.json`.
7. Respetar cambios locales existentes: el proyecto ya tenia modificaciones no commiteadas al crear esta documentacion.
