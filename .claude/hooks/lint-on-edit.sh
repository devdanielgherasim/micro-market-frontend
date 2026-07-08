#!/usr/bin/env bash
# Runs eslint on a file right after Claude edits it, matching the same
# `--max-warnings=0` gate CI enforces (package.json "lint" script) so
# failures surface locally instead of at the pipeline stage. Feeds the
# output back to Claude via "decision: block" (PostToolUse semantics: the
# turn continues, but Claude sees the reason and can fix it immediately).
set -uo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) echo '{"continue": true}'; exit 0 ;;
esac

if [[ ! -x node_modules/.bin/eslint ]]; then
  # Dependencies not installed yet -- nothing to run against.
  echo '{"continue": true}'
  exit 0
fi

OUTPUT="$(node_modules/.bin/eslint "$FILE_PATH" --max-warnings=0 2>&1)"
STATUS=$?

if [[ $STATUS -ne 0 ]]; then
  jq -n --arg reason "$OUTPUT" '{"decision": "block", "reason": $reason, "hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": $reason}}'
else
  echo '{"continue": true}'
fi
