# enterprise-sso-sample

Enterprise 向けアプリケーションに求められる SSO 認証を学ぶため、AI支援をうけながらサンプルアプリケーションを作成する

> [!NOTE]
> このリポジトリは learning 用途の段階的サンプル。各 track item で示す実装・運用例は学習要件に合わせた最小構成であり、production 運用ソリューションではない。

## Environment

* Claude code (AI Coding agent)
* その他は `scripts/initialize.sh` を参照

## Workflow

1. リポジトリを fork もしくは clone し、自分専用の作業環境を用意する
2. 学習開始タグ `a1-saml-sso/start` から自分の作業ブランチを切る

   ```bash
   git fetch origin
   git checkout -b my-work a1-saml-sso/start
   ```

3. `bash scripts/initialize.sh` を実行し、環境構築を行う
4. `docs/Curriculum.md` で全体像を把握し、対応する `docs/design-docs/<Item> <Topic>.md` を読んで実装を進める。不明点や疑問点などを質問し、新しい学びがあれば「調査レポートを書いて」もらう（`.claude/skills/capture-learning/` skill が起動して `docs/reports/` 以下にレポートが作成される）

## Notes

このアプリが参照する環境変数:

| 変数 | 用途 | 例 |
|---|---|---|
| `APP_URL` | SP の base URL | `http://localhost:3000` |
| `BOOTSTRAP_MODE` | 初期設定モード ON/OFF | `true` / `false` |
| `SUPER_USER_EMAIL` | 初期ログイン許可 email | (個別設定) |
| `SESSION_SECRET` | session cookie 署名鍵 | (ランダム長文字列) |

`SESSION_SECRET` のような機密値は **Claude を動かしているシェルとは別のターミナル** で扱うこと。同じシェルで `export` すると Claude プロセスが env を継承し、「機密値はリポジトリ・コンテキストに置かない」方針に反する。具体的な投入方法は各自のセキュリティ要件に応じて選ぶ (別シェル運用、secrets manager 経由など)。

## For Contributors

* `main`: 学習素材の最新状態を保つ branch。**各 track item の解答実装は main に入れない**
* `<item-id>-<topic>/start`: 各 track item の学習開始地点を表す **不変な tag**
* `<item-id>-<topic>/sample`: 各 track item の解答例を表す **不変な tag**（残すかは item ごとに判断）

### Naming rule for tags

```
<item-id>-<topic>/start
<item-id>-<topic>/sample
```

`<item-id>` は `docs/Curriculum.md` の track item ID を小文字化したもの（例: `a1`, `b2`, `c3`）。

例: `a1-saml-sso/start`, `b1-cookie-session/sample`

### Naming rule for design docs

```
docs/design-docs/<Item-ID> <Topic>.md
```

`<Item-ID>` は Curriculum.md の表記そのまま（例: `A1`, `B1`）、`<Topic>` は Curriculum.md の項目名と一致させる（Obsidian の note title として自然に見えるよう、半角スペース区切り）。

例: `A1 Single-tenant SAML SSO.md`, `B1 Cookie-based application session.md`

### Operation 1

1. main で対象 track item の Design Doc / scaffold / 学習導線(README の Workflow など)を整備しコミットする
2. main の HEAD で start タグを打つ

   ```bash
   git tag -a <item-id>-<topic>/start -m "Start of <Item-ID> — <Topic>"
   git push origin <item-id>-<topic>/start
   ```

### Operation 2

各 track item に対する解答例として sample tag を残す場合、別ブランチで実装し、その先端にタグを打つ

```bash
git checkout -b dev/<item-id>-<topic> <item-id>-<topic>/start
# sample 実装を進める
git tag -a <item-id>-<topic>/sample -m "Reference solution — <Item-ID> <Topic>"
git push origin <item-id>-<topic>/sample
```
- 作業ブランチ自体は push しなくてよい(tag が履歴記録の本体)
- 原則、main に merge はしない

