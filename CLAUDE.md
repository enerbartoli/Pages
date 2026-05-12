# Mnemo — Claude Code Instructions

## Proyecto
App de memoria personal con IA. Un solo archivo: `mnemo.html`.

## Al inicio de cada sesión — obligatorio
Instala el pre-commit hook si no existe:

```bash
cp scripts/update-version.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Esto garantiza que `MNEMO_VERSION` en `mnemo.html` se actualice automáticamente en cada commit.

## Control de versiones
Formato: `V{major}.{minor}`
- **major** = `(commits en main) - 16` — el offset de 16 compensa los 14 uploads manuales de la era pre-automation más 2 commits de setup que existían antes de formalizar el sistema
- **minor** = número de commits en la branch actual desde el último merge a main (incluyendo el commit en curso)

Ejemplo: `V15.1` → primera iteración de la era semántica (V15 = main tiene 31 commits, 31-16=15).

El hook `scripts/update-version.sh` calcula y escribe el número automáticamente antes de cada `git commit`. Nunca edites `MNEMO_VERSION` a mano.

### Merge strategy — OBLIGATORIO
Siempre mergear PRs con **"Squash and merge"** en GitHub (no "Create a merge commit").

Razón: "Create a merge commit" añade 2 commits a main (los commits de la branch + el merge commit), lo que causa saltos de versión (V15 → V17 en lugar de V15 → V16). Con "Squash and merge" cada PR añade exactamente 1 commit a main → versiones secuenciales limpias.

## Branch de desarrollo
Crear siempre una branch descriptiva desde main. Nunca commitear directo a main.

## Pestañas de MNEMO

| Tab | ID de vista | Descripción |
|---|---|---|
| Grafo | `graph-view` | Grafo de nodos force-directed sobre Canvas 2D. Nodos de proyectos, personas, reuniones y clusters. |
| Reuniones | (view) | Lista de reuniones con filtros por proyecto y persona. |
| Conversa | (view) | Chat con Claude usando el contexto de Mem0. |
| Admin | `admin-view` | Dashboard de estado del sistema. Requiere GitHub PAT. |

### Pestaña Admin — 5 secciones

1. **Resumen general** — `total_memories`, fecha de `stats.json`, botón de reload.
   - **Indicador de freshness (Fase 6b):** si `stats._metadata.scan_skipped == true`, muestra `ℹ️ Métricas de Mem0 actualizadas hace X` (o `⚠️` si > 24h). Sin `_metadata` → sin indicador (backward compat).
   - **Botón 🔄 Forzar refresh de stats:** dispara `memory_pipeline.yml` vía `workflow_dispatch`. Al ser `workflow_dispatch`, stats.py siempre hace scan completo independientemente del delta.
   - Muestra botón `⚙️ Configurar GitHub PAT` cuando el PAT no está configurado.
2. **Google Drive** — archivos totales, renamed, pending. Botones: `🔍 Dry-run rename` y `✏ Renombrar pendientes` (con `confirm()` para el apply).
3. **Mem0 — por source / por type** — tablas generadas desde `stats.json`.
4. **Imports manuales** — botones para disparar `import_claude_history.yml` e `import_chatgpt_history.yml` vía GitHub API. Muestra status del run.
5. **Errores recientes** — últimos 10 errores del array `errors_recent` en `stats.json`.

### GitHub PAT — localStorage

- **Clave:** `mnemo_github_pat`
- **Cuándo se lee:** al arrancar (`init()`) y al cambiar a la pestaña Admin (`switchView('admin')`)
- **Cuándo se escribe:** al hacer login con PAT en el form + al llamar `configPAT()`
- **Scopes requeridos:** `repo` (leer stats.json) + `workflow` (disparar workflows)
- **Función:** `configPAT()` — abre `prompt()` y guarda el valor en localStorage + variable global `GITHUB_PAT`

### stats.json — cómo se consume

El Admin tab hace `GET https://api.github.com/repos/enerbartoli/memory-pipeline/contents/stats.json` con `Accept: application/vnd.github.v3.raw` y `Authorization: token {GITHUB_PAT}`. El repo es privado, por eso requiere PAT.

### Workflow dispatch desde Admin

Función `triggerImport(wf, statusId)` — `POST /actions/workflows/{wf}/dispatches` con el PAT. Sondea el run más reciente cada 5s y muestra el `conclusion` en el UI.

Función `triggerRename(apply)` — mismo patrón, con input `apply: "true"|"false"`. El apply muestra `confirm()` con el número de archivos pendientes antes de disparar.

## LocalStorage — claves completas

| Clave | Descripción |
|---|---|
| `mnemo_ak` | Anthropic API key |
| `mnemo_mk` | Mem0 API key |
| `mnemo_uid` | Mem0 user ID (default: `rene_bartoli`) |
| `mnemo_github_pat` | GitHub PAT para Admin tab |
| `mnemo_usage` | Log de uso (últimas 500 entradas) |
| `mnemo_balance_start` | Balance inicial para calcular costo estimado |
| `mnemo_balance_ts` | Timestamp del balance inicial |

## Stack
- HTML/CSS/JS vanilla, sin build step, sin dependencias externas
- Canvas 2D para el grafo de nodos (force-directed, sin D3)
- Anthropic API + Mem0 API + GitHub REST API (Admin tab)
