#!/usr/bin/env bash
set -euo pipefail

mode="${1:---check}"
base_sha="${FORMAT_BASE_SHA:-}"
head_sha="${FORMAT_HEAD_SHA:-HEAD}"

if [[ "$mode" != "--check" && "$mode" != "--write" ]]; then
  echo "Usage: $0 [--check|--write]" >&2
  exit 2
fi

if [[ -z "$base_sha" || "$base_sha" =~ ^0+$ ]]; then
  if git rev-parse --verify "${head_sha}^" >/dev/null 2>&1; then
    base_sha="${head_sha}^"
  else
    base_sha="$(git rev-list --max-parents=0 "$head_sha")"
  fi
fi

mapfile -d '' files < <(
  git diff --name-only --diff-filter=ACMRT -z "$base_sha" "$head_sha" -- \
    '*.css' '*.js' '*.json' '*.md' '*.ts' '*.tsx' '*.yaml' '*.yml'
)

if (( ${#files[@]} == 0 )); then
  echo "No changed Prettier-supported files."
  exit 0
fi

echo "Running Prettier ${mode} for ${#files[@]} changed file(s):"
printf '  %s\n' "${files[@]}"

yarn prettier "$mode" "${files[@]}"
