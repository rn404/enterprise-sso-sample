# enterprise-sso-sample

Enterprise 向けアプリケーションに求められる SSO 認証を学ぶため、AI支援をうけながらサンプルアプリケーションを作成する

## Environment

* Claude code (AI Coding agent)
* その他は `scripts/initialize.sh` を参照

## Workflow

* リポジトリを fork もしくは clone し、自分専用の作業環境を用意する。その上で学習用ブランチを切って進める
* `bash scripts/initialize.sh` を実行し、環境構築を行う
* `docs/Design.md` の内容を読んで理解し、実装を進める。不明点や疑問点などを質問し、新しい学びがあれば「調査レポートを書いて」もらう（`.claude/skills/capture-learning/` skill が起動して `docs/reports/` 以下にレポートが作成される）

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
