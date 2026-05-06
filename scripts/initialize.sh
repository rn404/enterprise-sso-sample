#!/usr/bin/env bash
set -euo pipefail

# enterprise-sso-sample initialization script
#
# Purpose:
#   Perform the initial environment setup described in docs/Design.md.
#
# Prerequisites:
#   - Node.js (major version per mise.toml) is installed and on PATH
#     (mise / nvm / asdf / volta / etc. work)
#   - gh (GitHub CLI) is available
#
# Constraints:
#   - Generated files are overwritten on re-run. Preserving existing files is out of scope.
#   - Intended for local development environments.

cd "$(dirname "$0")/.."

for cmd in node npm npx gh; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found in PATH" >&2
    if [ "$cmd" = "gh" ]; then
      echo "  -> Install GitHub CLI: https://cli.github.com/" >&2
    fi
    exit 1
  fi
done

# Verify Node major version satisfies mise.toml requirement
expected_node=$(awk -F'"' '/^node[[:space:]]*=/ {print $2}' mise.toml)
actual_node=$(node --version | sed 's/^v//')
expected_major="${expected_node%%.*}"
actual_major="${actual_node%%.*}"

if [[ -z "$expected_node" ]]; then
  echo "Warning: could not read Node version from mise.toml; skipping version check" >&2
elif (( actual_major < expected_major )); then
  echo "Node major version is older than mise.toml requires" >&2
  echo "  expected: >= $expected_major (mise.toml: $expected_node)" >&2
  echo "  actual:   $actual_node" >&2
  if command -v mise >/dev/null 2>&1; then
    echo "  -> Running 'mise install' to install Node $expected_node..." >&2
    mise install
  else
    echo "  -> Install Node $expected_node via your version manager (nvm / asdf / volta / etc.)" >&2
    exit 1
  fi
fi

mkdir -p src/db db
touch db/.gitkeep

# Generate .gitignore (GitHub's Node template + project-specific additions)
gh repo gitignore view Node >.gitignore

cat >>.gitignore <<'EOF'

# DB runtime files
db/*
!db/.gitkeep

# macOS
.DS_Store

# Claude Code local settings
.claude/settings.local.json
EOF

cat >tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
EOF

cat >src/db/schema.sql <<'EOF'
-- Define application tables required by this app here.
-- src/db/migrate.ts reads this file and applies it to SQLite.
EOF

cat >src/db/migrate.ts <<'EOF'
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "schema.sql");
const dbPath =
  process.env.DATABASE_PATH ?? resolve(here, "../../db/app.sqlite");

const schema = readFileSync(schemaPath, "utf-8");
const db = new DatabaseSync(dbPath);
try {
  db.exec(schema);
  console.log(`schema applied to ${dbPath}`);
} finally {
  db.close();
}
EOF

# SQLite uses Node's built-in node:sqlite (DatabaseSync); no extra dependency needed

# Install without running any lifecycle scripts to defer arbitrary code execution
# until the audit step has vetted the resolved package set.
npm install --ignore-scripts \
  hono \
  @hono/node-server \
  @node-saml/node-saml \
  @xmldom/xmldom

npm install --save-dev --ignore-scripts \
  typescript \
  tsx \
  @types/node \
  oxlint \
  oxfmt

# Abort if high-or-critical vulnerabilities are present in installed packages.
# This must run BEFORE 'npm rebuild' so malicious lifecycle scripts cannot execute.
npm audit --audit-level=high

# Now that audit has passed, run lifecycle scripts (postinstall etc.)
# so that packages like oxlint / oxfmt can fetch their platform binaries.
npm rebuild

# package.json scripts
npm pkg set scripts.dev="tsx watch src/index.ts"
npm pkg set scripts.start="tsx src/index.ts"
npm pkg set scripts.autofix="oxfmt && oxlint --fix"
npm pkg set scripts.source-guard="oxfmt --check && oxlint && tsc"
npm pkg set scripts.runtime-guard="echo 'no runtime checks yet' && exit 0"
npm pkg set scripts.precommit="npm run autofix && npm run source-guard"
npm pkg set scripts.db:migrate="tsx src/db/migrate.ts"

[ -f .oxfmtrc.json ] || npx oxfmt --init
[ -f .oxlintrc.json ] || npx oxlint --init

npm run db:migrate

npm run autofix
npm run source-guard

echo "initialize.sh done"
