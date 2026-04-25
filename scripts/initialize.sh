#!/usr/bin/env bash
set -euo pipefail

# enterprise-sso-sample 初期化スクリプト
#
# 目的:
#   docs/Design.md "Step 1: プロジェクト初期化" に相当する作業を集約し、
#   実行ログとして後から参照できる形で残す。
#   ディレクトリ構成 / 設定ファイル / 依存インストール / DB マイグレーションを
#   一つのスクリプトに集約する。
#
# 前提:
#   - mise.toml で固定した Node.js が利用可能であること
#   - 環境変数 (BASE_URL / BOOTSTRAP_MODE / SUPER_USER_EMAIL /
#     SESSION_SECRET / DATABASE_PATH など) は .env を使わず、
#     必要に応じて Bitwarden 経由でシェルに export して利用する
#
# 再実行:
#   生成ファイルは上書きされる。手動編集した場合は注意。

cd "$(dirname "$0")/.."

mkdir -p src/db db
touch db/.gitkeep

if ! grep -q '^db/\*\.sqlite$' .gitignore 2>/dev/null; then
  cat >>.gitignore <<'EOF'

# SQLite database files (db/.gitkeep のみ追跡)
db/*.sqlite
db/*.sqlite-journal
db/*.db
EOF
fi

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
create table if not exists saml_settings (
  id text primary key,
  idp_entity_id text,
  idp_sso_url text,
  idp_certificate text,
  name_id_format text,
  email_attribute text,
  enabled integer not null default 0,
  created_at text not null,
  updated_at text not null
);
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

# SQLite は Node 標準の node:sqlite (DatabaseSync) を使うため追加依存なし。
# 過去の実行で better-sqlite3 を導入していた場合は除去する。
npm uninstall better-sqlite3 @types/better-sqlite3 2>/dev/null || true

npm install \
  hono \
  @hono/node-server \
  @node-saml/node-saml

npm install --save-dev \
  typescript \
  tsx \
  @types/node \
  oxlint \
  oxfmt

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
npm audit || true
npm run autofix
npm run source-guard

echo "initialize.sh done"
