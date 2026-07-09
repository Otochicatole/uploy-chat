# Feature - UI compartida y estilos

## Archivos

- `src/app/globals.css`
- `src/shared/ui/AppIcon/AppIcon.tsx`
- `src/shared/ui/IconButton/IconButton.tsx`
- `src/features/chat/ui/Tabs/Tabs.tsx`
- `src/features/chat/ui/DropdownMenu/DropdownMenu.tsx`

## Responsabilidad

Contiene piezas visuales reutilizables y tokens globales.

## EDD

### Render de boton iconico

- Evento: un componente usa `IconButton`.
- Decision: si `variant = send`, usa `ArrowUp` de lucide y estilos de gradiente; si no, usa `AppIcon`.
- Datos: props `disabled`, `icon`, `label`, `variant`.
- Desenlace: boton accesible por `aria-label`.

### Render de tabs

- Evento: `ProjectWorkspace` renderiza `Tabs`.
- Decision: compara `item.id` con `selected`.
- Datos: `items`, `selected`.
- Desenlace: tab activa tiene borde acento y background surface.

### Dropdowns de modelo

- Evento: `ModelSelect`, `ChatRow` o `ChatHeader` abren un menu de modelos.
- Decision: calculan el espacio disponible con `getBoundingClientRect` y el alto del menu para elegir apertura hacia arriba o hacia abajo.
- Datos: estado local de placement y opciones `modelOptions`.
- Desenlace: el dropdown queda dentro del viewport con altura maxima y scroll cuando no hay espacio suficiente.

### Menu dropdown generico

- Evento: `DropdownMenu` se renderiza.
- Decision: itera opciones sin callbacks.
- Datos: `options`.
- Desenlace: menu visual sin comportamiento. Actualmente no parece importado.

## Tokens visuales

Los tokens de color se definen en `globals.css` con `@theme inline`. Mantener nombres `uploy-*` al agregar estilos.

## Notas para cambios

- `AppIcon` duplica algunos iconos que tambien existen en lucide. La UI actual mezcla ambos enfoques.
- Si se estandariza iconografia, preferir lucide por consistencia con la mayor parte de la feature.
- `DropdownMenu` necesita callback por opcion antes de ser util para acciones reales.
