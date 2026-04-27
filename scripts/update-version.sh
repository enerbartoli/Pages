#!/bin/bash
# Updates MNEMO_VERSION in mnemo.html based on git history.
# Format: V{main_commits}.{branch_commits_including_current}
# Used as .git/hooks/pre-commit — see CLAUDE.md for setup instructions.

MAIN=$(git rev-list --count origin/main 2>/dev/null || git rev-list --count main 2>/dev/null || echo "0")
MAIN=$((MAIN - 26))  # Offset: 14 uploads + 12 intermediate merge artifacts during V15 cleanup
BRANCH=$(git rev-list origin/main..HEAD --count 2>/dev/null || git rev-list main..HEAD --count 2>/dev/null || echo "0")
VER="V${MAIN}.$((BRANCH + 1))"

sed -i "s/const MNEMO_VERSION='[^']*'/const MNEMO_VERSION='${VER}'/" mnemo.html
sed -i "s|<span class=\"version-badge\" id=\"version-badge\">[^<]*</span>|<span class=\"version-badge\" id=\"version-badge\">${VER}</span>|" mnemo.html

git add mnemo.html
echo "[mnemo] version → ${VER}"
