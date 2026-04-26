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
- **major** = número de commits en `main` (cada merge/upload a main)
- **minor** = número de commits en la branch actual desde el último merge a main (incluyendo el commit en curso)

Ejemplo: `V14.6` → 14 versiones subidas a main, 6to cambio en la branch actual.

El hook `scripts/update-version.sh` calcula y escribe el número automáticamente antes de cada `git commit`. Nunca edites `MNEMO_VERSION` a mano.

## Branch de desarrollo
Crear siempre una branch descriptiva desde main. Nunca commitear directo a main.

## Stack
- HTML/CSS/JS vanilla, sin build step, sin dependencias externas
- Canvas 2D para el grafo de nodos (force-directed, sin D3)
- Anthropic API + Mem0 API
