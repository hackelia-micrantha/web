#!/usr/bin/env bash
set -euo pipefail

base_sha="${LINT_BASE_SHA:-}"
head_sha="${LINT_HEAD_SHA:-HEAD}"

if [[ -z "$base_sha" || "$base_sha" =~ ^0+$ ]]; then
  if git rev-parse --verify "${head_sha}^" >/dev/null 2>&1; then
    base_sha="${head_sha}^"
  else
    base_sha="$(git rev-list --max-parents=0 "$head_sha")"
  fi
fi

mapfile -d '' files < <(
  git diff --name-only --diff-filter=ACMRT -z "$base_sha" "$head_sha" -- \
    '*.js' '*.jsx' '*.ts' '*.tsx'
)

if (( ${#files[@]} == 0 )); then
  echo "No changed ESLint-supported files."
  exit 0
fi

echo "Linting ${#files[@]} changed file(s):"
printf '  %s\n' "${files[@]}"

yarn eslint "${files[@]}"
