#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# propagate.sh — propage la dernière version de @latitude/ui à tous les projets.
#
# À lancer DEPUIS le repo latitude-ui, APRÈS avoir push une modif du design
# system sur GitHub :
#     ./scripts/propagate.sh
#
# Ce qu'il fait, projet par projet (dossiers voisins de latitude-ui) :
#   • Apps Next/bun (latitude-crm, latitude-diagnostic) : bun update @latitude/ui
#     → commit du lockfile si changé → push (uniquement si la branche = main).
#   • Site statique (latitude-web) : recopie theme.css → latitude-ui-theme.css
#     → commit si changé → push (si main). Les pages le lient en <link>.
#
# Sûr : ne change jamais de branche, ne push que si on est sur main (sinon
# il commit et te prévient de pousser à la main). Idempotent.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"   # dossier parent (…/Projets Claude AI)
UI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"     # …/latitude-ui

# Apps qui consomment le package via npm/bun
BUN_CONSUMERS=("latitude-crm" "latitude-diagnostic")
# Sites statiques qui vendorisent le theme.css
STATIC_CONSUMERS=("latitude-web")

echo "▸ Propagation @latitude/ui depuis : $UI_DIR"
echo "  (commit courant : $(git -C "$UI_DIR" rev-parse --short HEAD))"

push_if_main () {
  local dir="$1" msg="$2"
  local branch; branch="$(git -C "$dir" rev-parse --abbrev-ref HEAD)"
  git -C "$dir" commit -q -m "$msg"
  if [ "$branch" = "main" ]; then
    git -C "$dir" push -q origin main && echo "  ✅ commité + poussé (main)"
  else
    echo "  ⚠️  commité sur '$branch' (pas main) — pousse/merge à la main"
  fi
}

for repo in "${BUN_CONSUMERS[@]}"; do
  dir="$ROOT/$repo"
  echo ""
  echo "▶ $repo"
  [ -d "$dir" ] || { echo "  ⏭  absent, skip"; continue; }
  grep -q '@latitude/ui' "$dir/package.json" 2>/dev/null || { echo "  ⏭  ne consomme pas @latitude/ui, skip"; continue; }
  ( cd "$dir" && bun update @latitude/ui >/dev/null 2>&1 ) || { echo "  ❌ bun update a échoué"; continue; }
  if [ -n "$(git -C "$dir" status --porcelain -- bun.lock package.json)" ]; then
    git -C "$dir" add bun.lock package.json
    push_if_main "$dir" "chore(ui): bun update @latitude/ui (propagation design system)"
  else
    echo "  ✓ déjà à jour"
  fi
done

for repo in "${STATIC_CONSUMERS[@]}"; do
  dir="$ROOT/$repo"
  echo ""
  echo "▶ $repo (statique)"
  [ -d "$dir" ] || { echo "  ⏭  absent, skip"; continue; }
  cp "$UI_DIR/src/theme.css" "$dir/latitude-ui-theme.css"
  if [ -n "$(git -C "$dir" status --porcelain -- latitude-ui-theme.css)" ]; then
    git -C "$dir" add latitude-ui-theme.css
    push_if_main "$dir" "chore(ui): sync latitude-ui-theme.css (propagation design system)"
  else
    echo "  ✓ déjà à jour"
  fi
done

echo ""
echo "✓ Terminé. Vercel redéploiera les projets poussés."
