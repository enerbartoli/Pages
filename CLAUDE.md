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

## Stack
- HTML/CSS/JS vanilla, sin build step, sin dependencias externas
- Canvas 2D para el grafo de nodos (force-directed, sin D3)
- Anthropic API + Mem0 API
