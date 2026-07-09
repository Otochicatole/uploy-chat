# Uploy Chat - Guia para agentes IA

Esta carpeta documenta el proyecto para que otra IA pueda entenderlo y modificarlo sin tener que redescubrir la arquitectura desde cero.

## Resumen

Uploy Chat es una app Next.js con App Router que simula un workspace de chat con proyectos. Hoy funciona como prototipo front-end: no hay backend, no hay llamadas a API y las respuestas del asistente se generan con contenido mock despues de un timer.

La fuente principal de comportamiento es `src/features/chat/model/ChatProvider.tsx`. La fuente principal de tipos es `src/features/chat/model/chat.types.ts`. El estado inicial y textos mock viven en `src/features/chat/model/chat.mock.ts`.

## Stack

- Next.js 16 con App Router.
- React 19.
- TypeScript estricto.
- Tailwind CSS v4.
- `lucide-react` para iconos.
- Estado client-side con React Context.
- Persistencia en `window.localStorage` bajo la clave `uploy-chat-state-v1`.

## Como leer esta carpeta

- `architecture.md`: mapa del proyecto, rutas y limites server/client.
- `state-model.md`: entidades, relaciones y persistencia.
- `behaviors-edd.md`: comportamientos globales usando EDD.
- `features/`: detalle por feature funcional.
- `maintenance-notes.md`: deuda, riesgos y recomendaciones para futuras IAs.

## Convencion EDD usada aca

En estos documentos, EDD significa documentacion orientada a eventos:

- Evento: accion del usuario, ruta o efecto async que inicia el flujo.
- Decision: reglas y bifurcaciones del dominio/UI.
- Datos: estado leido o modificado.
- Desenlace: efecto observable en UI, ruta, persistencia o timer.

Si el equipo usa otra definicion de EDD, mantener la intencion: describir comportamiento desde el evento hasta el cambio visible.

## Reglas para otra IA

1. Antes de cambiar comportamiento, leer `ChatProvider.tsx`; casi todas las acciones pasan por sus callbacks.
2. No asumir backend real. Los mensajes, fuentes, proyectos y respuestas son estado local.
3. No tomar `src/config/chat-content.ts` ni `src/config/chat-navigation.ts` como fuente activa; hoy parecen artefactos legacy no importados.
4. Las rutas de `src/app/**/page.tsx` no contienen UI propia; solo construyen `initialRoute` y renderizan `ChatPage`.
5. Si se agrega una feature, actualizar tipos en `chat.types.ts`, accion en `ChatProvider.tsx` y UI correspondiente.
6. Si una accion debe sobrevivir reload, debe pasar por `commitState` o escribir explicitamente el estado persistido.
7. Respetar cambios locales existentes: el proyecto ya tenia modificaciones no commiteadas al crear esta documentacion.
