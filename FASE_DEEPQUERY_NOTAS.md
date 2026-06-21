# FASE DEEPQUERY — Notas de implementación (mnemo.html)

> Repo: `enerbartoli/Pages`. Cambios 1–3 sobre `mnemo.html`. La auditoría arquitectónica (bloque 4) vive en `enerbartoli/memory-pipeline/AUDITORIA_ARQUITECTURA.md`.

## Contexto importante — reconciliación con el estado real del código

El brief original describía el chat como "inyecta ~5 memorias por relevancia vía el endpoint `search` de Mem0" sobre "206 memorias". **Ese ya no era el estado del código** al momento de esta fase:

- Desde **V60–V63** la app carga **todas** las memorias (paginado `getAll`, `page_size=1000`) en el array global `memories` al iniciar sesión, con cache TTL de 5 min.
- Desde **V63.1** el chat NO usa el endpoint `search` de Mem0. Usa `searchLocalMemories(query, 12)`: ranking local por frecuencia de términos sobre el set completo, top 12 inyectadas.
- El total real de memorias es **~6,673**, no 206.

Las decisiones de abajo se tomaron contra el estado real, no contra el brief.

---

## CAMBIO 1 — Botón "Copiar" en respuestas del asistente

- `appendMsg()`: cuando `role==='assistant'` y hay texto, se agrega un `.msg-actions` con un botón `.msg-copy-btn` ("Copiar").
- Copia el **texto plano** original (no el HTML renderizado) — se captura `text` en el closure antes de pasar por `fmt()`.
- `copyMessage()` usa `navigator.clipboard.writeText()` con fallback a `document.execCommand('copy')` para WebKit sin clipboard API en contextos no seguros.
- Feedback: "Copiado ✓" durante 1.5s, luego vuelve a "Copiar".
- Aplica a todos los mensajes del asistente de la sesión (todos pasan por `appendMsg`). No hay persistencia de chat entre recargas, así que no hay historial previo que reconstruir.
- Solo en burbujas del asistente — las del usuario no llevan botón.

## CAMBIO 2 — Modo "Consulta profunda" (deep query)

- Nuevo toggle 🗂 en la barra del chat (`toggleDeepQuery`, `deepQueryEnabled`, default OFF), mismo patrón que los toggles existentes.
- **Decisión de diseño (clave):** como la app YA tiene todas las memorias en memoria (`getAll` completo en el init), la consulta profunda **filtra el array local** en lugar de llamar a un endpoint `v2`/`getAll` con `filters` por separado. Esto:
  - Recupera **TODAS** las que coinciden (no top-k) — que es el objetivo del modo.
  - **Cero** consumo extra de cuota de Mem0 (crítico en el tier FREE).
  - No inventa parámetros de API no verificados (respeta la restricción del brief). Filtrar el resultado completo de `getAll` es funcionalmente equivalente a `getAll` + `filters`.
- `parseDeepQuery(text)` parsea en JS periodo + subject desde lenguaje natural:
  - "últimas dos semanas", "últimos N días", "última semana", "últimos N meses/semanas", "último mes".
  - "del D al D de MES [de AAAA]".
  - "MES [de] [AAAA]" (rango del mes completo).
  - Subject = query menos la frase de fecha menos palabras de relleno/trigger.
- `deepFilterMemories({from,to,subject})`:
  - Filtra por `metadata.date` (ISO, ya estandarizado), con fallback a `created_at`/`updated_at`. Memorias sin fecha quedan fuera de filtros por periodo (ver auditoría).
  - Filtra subject por substring en contenido + metadata.
  - Ordena por fecha descendente (más reciente primero). Devuelve **todas**.
- Inyección a Claude (reaprovecha el patrón de export summary): máx **60** memorias, truncadas a **200** chars, con fecha prefijada. Si hay más de 60: UI muestra "mostrando resumen de 60, hay N en total".
- UI: mensaje de sistema "🗂 Encontré N memorias que coinciden (periodo · tema)".
- Con el toggle **OFF**: comportamiento idéntico al default actual (`searchLocalMemories`, top 12). Se conserva ese default real en vez del "5 vía search" del brief (que ya no existía).

## CAMBIO 3 — Resiliencia ante backgrounding en iOS ("Load failed")

- **Observación:** tras V63.1 la recuperación de memorias es 100% local (sin red). El único fetch interrumpible del turno de chat es la llamada a **Anthropic**. `saveToMem0` es post-éxito, fire-and-forget y ya envuelto en try/catch silencioso.
- Refactor del turno de chat:
  - `prepareContext(text)` corre **una sola vez** (incluye los efectos de UI de la consulta profunda) antes del fetch, de modo que un reintento nunca duplica el conteo de deep query ni el guardado.
  - `attemptChatTurn(turn)` ejecuta la llamada a Anthropic con detección de interrupción.
- `_isInterruption(e)`: `true` para `AbortError`/`TypeError` o mensajes "load failed"/"failed to fetch"/"network". Los errores reales de API (`!res.ok` → `new Error(api message)`) NO se marcan como interrupción.
- Detección foreground/background con `document.visibilityState` + listener `visibilitychange` durante el request.
- Recuperación: si el fetch falla por interrupción **y** la app estuvo/está oculta y aún no se reintentó (`attempts<2`):
  - El indicador muestra "reanudando al volver a la app…" (clase `.resuming`).
  - Al volver a `visible`, reintenta **una** vez con backoff corto (600ms).
- Si vuelve a fallar ya en foreground, o es error real de API: muestra el error real con botón **"Reintentar"** (`retryChatTurn`).
- **Idempotencia:** `saveToMem0` y el push a `chatMessages` solo ocurren en el éxito final; el intento abortado se descarta (su resultado nunca llega). No se duplica respuesta ni memoria.
- No bloquea la UI durante el reintento (todo asíncrono).
- **Limitación documentada:** si iOS mata la página por completo (background largo / presión de memoria), no hay recuperación en la misma sesión; lo máximo es reintento manual al reabrir.

---

## Verificación

- `node --check` sobre el bloque `<script>` extraído: OK.
- Toggles OFF → flujo normal sin cambios (no regresión en optimización de tokens).
