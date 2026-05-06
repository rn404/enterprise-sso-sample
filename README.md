# enterprise-sso-sample

Enterprise 向けアプリケーションに求められる SSO 認証を学ぶため、AI支援をうけながらサンプルアプリケーションを作成する

## Environment

* Claude code (AI Coding agent)
* その他は `scripts/initialize.sh` を参照

## Workflow

1. リポジトリを fork もしくは clone し、自分専用の作業環境を用意する
2. 学習開始ブランチ `scope1-saml-sso/start` から自分の作業ブランチを切る

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

学習素材としてこのリポジトリをメンテナンスする人向けの運用ガイド。

### ブランチ戦略

* `main`: 学習素材としての最新状態。README / Design.md / scripts などの更新はここに入れる
* `scope1-saml-sso/start`: scope 1 (SAML SSO) の学習開始地点。学習者はこのブランチから作業ブランチを切る

`scope1-saml-sso/start` は「scope 1 の学習を始めるのに必要十分な状態」を維持する。SAML SSO の実装は含めず、scaffold / 設計ドキュメント / 学習導線の更新のみを反映していく。

### main の更新を `scope1-saml-sso/start` に反映する

README や Design.md など、学習開始時点で参照すべき内容に変更が入った場合は、main のコミットを `scope1-saml-sso/start` に cherry-pick する。

```bash
git checkout scope1-saml-sso/start
git cherry-pick <commit-hash>
git push origin scope1-saml-sso/start
git checkout main
```

scope の解答そのものになる実装コミットは反映しないこと。
