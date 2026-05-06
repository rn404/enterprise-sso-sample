# enterprise-sso-sample

Enterprise 向けアプリケーションに求められる SSO 認証を学ぶため、AI支援をうけながらサンプルアプリケーションを作成する

## Environment

* Claude code (AI Coding agent)
* その他は `scripts/initialize.sh` を参照

## Workflow

1. リポジトリを fork もしくは clone し、自分専用の作業環境を用意する
2. 学習開始タグ `scope1-saml-sso/start` から自分の作業ブランチを切る

   ```bash
   git fetch origin
   git checkout -b my-work scope1-saml-sso/start
   ```

3. `bash scripts/initialize.sh` を実行し、環境構築を行う
4. `docs/Design.md` の内容を読んで理解し、実装を進める。不明点や疑問点などを質問し、新しい学びがあれば「調査レポートを書いて」もらう（`.claude/skills/capture-learning/` skill が起動して `docs/reports/` 以下にレポートが作成される）

## Notes

アプリケーション実行で参照したい環境変数は `.env` ファイルではなく、各自セキュアな方法で export する (AI 支援前提のため、機密値はリポジトリ・コンテキストに置かない)

Example:

```bash
export APP_URL=http://localhost:3000
export BOOTSTRAP_MODE=true
export SUPER_USER_EMAIL=operator@example.com
export SESSION_SECRET=<long-random-string>

npm run dev
```

## For Contributors

* `main`: 学習素材の最新状態を保つ branch。**scope の解答実装は main に入れない**
* `scopeN-<topic>/start`: 各 scope の学習開始地点を表す **不変な tag**
* `scopeN-<topic>/sample`: 各 scope の解答例を表す **不変な tag**（残すかは scope ごとに判断）

### Naming rule for tags

```
scope<連番>-<topic>/start
scope<連番>-<topic>/sample
```

例: `scope1-saml-sso/start`, `scope2-oidc-sso/sample`

### Operation 1

1. main で対象 scope の Design Doc / scaffold / 学習導線(README の Workflow など)を整備しコミットする
2. main の HEAD で start タグを打つ

   ```bash
   git tag -a scopeN-<topic>/start -m "scope N (<topic>) 学習開始地点"
   git push origin scopeN-<topic>/start
   ```

### Operation 2

各scope に対する解答例として sample tag を残す場合、別ブランチで実装し、その先端にタグを打つ

```bash
git checkout -b dev/scopeN-<topic> scopeN-<topic>/start
# sample 実装を進める
git tag -a scopeN-<topic>/sample -m "scope N (<topic>) 解答例"
git push origin scopeN-<topic>/sample
```
- 作業ブランチ自体は push しなくてよい(tag が履歴記録の本体)
- 原則、main に merge はしない

