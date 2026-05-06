# A1. Single-tenant SAML SSO

## 1. 目的

`enterprise-sso-sample` は、社内オペレーター向け Admin アプリケーションに Enterprise SSO を導入する構造を理解するためのサンプル実装である。

最初の対象は **SAML SSO** とし、以下を実際に動かしながら扱う。

* Admin アプリケーションが Service Provider（SP）として振る舞う流れ
* 社内 Identity Provider（IdP）の設定値を SP に登録する流れ
* SP 側から IdP に登録する ACS URL / Entity ID / Metadata URL の意味
* SAML Response を受け取り検証し、Admin 用アプリケーションセッションへ変換する流れ
* SAML SSO によってオペレーション画面を保護する基本構造

本サンプルは production-ready な実装ではなく、SAML SSO の構造理解を目的とする。

## 2. 前提

このサンプルは、顧客向け SaaS の利用者画面ではなく、**自社の Admin operator が利用する Internal Admin Area** を想定する。

```text
enterprise-sso-sample = SP / Service Provider
Auth0 = IdP / Identity Provider
Admin operator = Auth0 経由で SAML SSO ログインする利用者
```

本番環境では、オペレーション画面は自社のセキュリティ管理・権限管理・監査ログの配下に置かれるべきものである。本サンプルでは、その入口として SAML SSO を実装する。

サンプル実装の都合として、IdP には Auth0 SAML2 Web App Addon を利用し、ローカル環境での動作確認には ngrok（または同等のトンネル）を利用する。本番では IdP は自社管理のものに、トンネルは適切な公開エンドポイントに置き換わる位置付けである。

## 3. ゴール

以下が動く状態を本サンプルの完成とする。

```text
IdP を設定し終えた状態で enterprise-sso-sample を SP として動かし、
SAML SSO で Internal Admin Area にログインできること。
```

これを通じて以下の関係を理解できる状態になることを目指す。

* SP が IdP に渡す設定値
* SP が IdP から受け取る設定値
* SAML Request / Response の流れ
* SAML 認証結果と Admin アプリケーション内セッションの違い
* Admin 画面を Enterprise SSO で保護する基本構造

## 4. 実装スコープ

### 4.1 対象範囲

* **管理画面**
  * ログイン画面
  * ダッシュボード
  * operator 情報表示
  * SAML settings 画面 (SP 設定値の表示 / IdP Metadata XML の登録)
* **SAML プロトコルハンドリング**
  * AuthnRequest の生成と IdP へのリダイレクト
  * SAML Response の受信と検証
  * SP metadata XML の公開
* **アプリケーションセッション管理**
  * SAML SSO 成功時の session cookie 発行
  * ログアウト時の session cookie 破棄

### 4.2 対象外

ゴールに含まれない範囲は対象外とする。本サンプルの方針として以下を明示する。

* 本番利用としての堅牢化 (HTTPS、サーバ側セッション、cookie 保護、証明書ローテ、監査ログ、`/saml-settings` の権限制御等)
* 別認証プロトコル (OIDC SSO 等)
* SAML プロトコル拡張機能 (Single Logout、IdP-initiated SSO の完全対応 等)

拡張候補の詳細については 後述の将来拡張 を参照。

## 5. ユースケース

この項目に記載されている内容は、サンプル実装内の必須要件とする。

### 5.1 初期設定: SP に IdP 情報を登録する

SAML settings 画面 ( `/saml-settings` ) は初期設定モードでアプリケーションを起動しているときのみアクセス可とする。この初期設定モードを以降 bootstrap mode と呼ぶ。
初期設定完了後は bootstrap mode をオフにし、起動し直すこととする。

切り替え後は、 SAML SSO ログイン済みの initial super user のみが SAML settings 画面で SAML settings を編集できるものとする。

1. `BOOTSTRAP_MODE=true` でアプリケーションを起動し、`/saml-settings` にアクセスする
2. SP 側設定として ACS URL / Entity ID / Metadata URL を確認する
3. Auth0 の SAML2 Web App Addon に SP 側設定値を登録する
4. Auth0 から IdP Metadata XML を取得する
5. `/saml-settings` に IdP Metadata XML を利用して、SAML settings を保存する
6. `BOOTSTRAP_MODE=false` に切り替えてアプリケーションを再起動する
7. SAML SSO ログインをテストする

### 5.2 Admin operator が SAML SSO でログインする

1. Admin operator が `/login` にアクセスする
2. `Continue with SSO` を押す
3. アプリケーションが SAML Request を作成し、IdP にリダイレクトする
4. Admin operator が Auth0 で認証される
5. Auth0 が SAML Response を `/saml/acs` に POST する
6. アプリケーションが SAML Response を検証する
7. NameID / attributes から operator 情報を取得する
8. Admin 用セッションを作成する
9. `/dashboard` に遷移する
10. `/me` でログイン中 operator 情報を確認する

## 6. アーキテクチャ

### 6.1 全体構成

```text
Admin Operator Browser
  |
  | access /login
  v
enterprise-sso-sample
  |  SP
  |  - SAML settings management
  |  - SAML Request generation
  |  - ACS endpoint
  |  - admin session management
  |
  | redirect with SAML Request
  v
Auth0
  |  IdP
  |
  | POST SAML Response
  v
enterprise-sso-sample /saml/acs
  |
  | create admin session
  v
/dashboard
```

### 6.2 技術スタック

* Runtime: Node.js
* Web framework: Hono
* Database: SQLite（`node:sqlite` の `DatabaseSync`）
* SAML library: `@node-saml/node-saml`
* XML parser: `@xmldom/xmldom`（IdP Metadata XML / SAML Response のパース用）
* Session: signed cookie based session
* IdP: Auth0
* Public tunnel: ngrok（または同等）

これらは `scripts/initialize.sh` で固定的に install される。依存パッケージの選定背景は後述する。

### 6.3 依存パッケージの選定背景

| パッケージ                        | 用途                                    | 選定背景                                                       |
| ---------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `hono` / `@hono/node-server` | Web framework / Node アダプタ             | 軽量で型推論が強く、SAML route の追加が短く書ける                             |
| `@node-saml/node-saml`       | SAML Request 生成 / Response 検証         | XML 署名検証は外部ライブラリに委ね、本サンプルではアルゴリズムを自前実装しない                  |
| `@xmldom/xmldom`             | IdP Metadata XML / SAML Response のパース | Node.js 環境で XML を扱う実質スタンダード。呼び出し側で XXE / 外部実体展開を無効化する設定を施す |
| `tsx` / `typescript`         | TypeScript 実行・型検査                     | 開発体験向け                                                     |
| `oxlint` / `oxfmt`           | 静的解析・整形                               | 開発体験向け                                                     |

### 6.4 URL 生成方針について

ローカル実行とトンネル公開の両方に対応するため、SP 側 URL は `APP_URL` から生成するものとする。

通常のローカル開発時:

```env
APP_URL=http://localhost:3000
```


ngrok などを利用した動作確認時:

```env
APP_URL=https://xxxx.ngrok-free.app
```


生成される SP 設定値:

```text
ACS URL:      ${APP_URL}/saml/acs
Entity ID:    ${APP_URL}/saml/metadata
Metadata URL: ${APP_URL}/saml/metadata
```


## 7. データモデル

今回の実装スコープで、データ保持・参照する想定のものを以下で定義する。

### 7.1 bootstrap mode

セットアップ用フラグ。環境変数で制御する。

```env
BOOTSTRAP_MODE=true
```


### 7.2 initial super user

初期ログインを許可するユーザーはサンプル実装における簡略化のため、 DB ではなく環境変数で指定する。アプリケーション起動時に許可された初期ユーザーとして扱う。

```env
SUPER_USER_EMAIL=operator@example.com
```

ログイン許可条件:

```text
SAML Response から取得した email または NameID が SUPER_USER_EMAIL と一致すること
```

この制約により、SAML settings 画面へアクセスできるユーザーを最小限に絞る。


### 7.3 saml_settings

SAML SSO のログインフローは毎回 IdP 設定を参照する必要があるが、IdP 設定は IdP 側の管理者が変更しない限り変わらない。このため bootstrap mode で IdP Metadata XML から登録した内容を永続化し、アプリケーションの再起動を跨いで再利用できる形で保持する。

### 7.4 application session

今回の実装スコープでは DB には保存せず、署名付き cookie に最小限の情報を保持する形とする。

保持する情報:
```json
{
  "nameId": "operator@example.com",
  "email": "operator@example.com",
  "attributes": {},
  "createdAt": "2026-04-25T00:00:00.000Z"
}
```


## 8. エンドポイント設計

このアプリケーション自体をオペレーション画面として構成するため、`/admin` prefix は使わない。ログイン後のメイン画面は `/` とする。

未ログインで保護対象ページにアクセスした場合は、原則として `/login` にリダイレクトする。ただし `BOOTSTRAP_MODE=true` の間だけ、`/saml-settings` 系は未ログインでもアクセスできる。

| Method | Path                          | 目的                                                                            |
| ------ | ----------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/`                           | ダッシュボード                                                                       |
| GET    | `/login`                      | ログイン画面（SAML settings 未登録時は設定画面への導線を表示）                                       |
| GET    | `/saml/login`                 | SAML Request を生成して IdP へリダイレクト                                                |
| POST   | `/saml/acs`                   | SAML Response の受信、検証、application session の発行                                   |
| GET    | `/saml/metadata`              | SP metadata XML を返す                                                           |
| GET    | `/me`                         | ログイン中 operator 情報を表示                                                          |
| GET    | `/saml-settings`              | SAML settings 表示（`BOOTSTRAP_MODE=false` の場合は initial super user のみアクセス可）        |
| POST   | `/saml-settings/idp-metadata` | IdP Metadata XML 登録（アクセス制御は `/saml-settings` と同じ）                              |
| POST   | `/logout`                     | application session の破棄（SAML Single Logout は前述の実装スコープ内の対象外を参照）                 |


## 9. 検証観点と失敗パターン

SAML Response 受信時に最低限以下を確認する。

* 署名が正しいこと
* IdP Entity ID が登録値と一致すること
* Audience が SP Entity ID と一致すること
* ACS URL が想定された宛先であること
* Assertion が有効期限内であること
* NameID または email attribute が取得できること

故意に壊して挙動を観察する失敗パターン:

* 証明書を間違える
* ACS URL を間違える
* Entity ID / Audience を間違える
* email attribute を消す
* SAML settings disabled の状態でログインしようとする
* `APP_URL` と Auth0 側設定を一致させない

---

## 10. 将来拡張

ゴール達成後に追加実装し得る項目を、性質ごとに分類して列挙する。

### 10.1 SAML プロトコルの追加機能

* SAML Single Logout（SP-initiated / IdP-initiated。Auth0 で end-to-end 検証可能）
* IdP-initiated SSO の完全対応
* Metadata の自動 refresh

### 10.2 別プロトコル / 別 IdP 対応

* OIDC SSO（authorization code flow、ID Token 検証、SAML との比較画面）
* 複数 IdP（環境差分、IdP selection UI）

### 10.3 本番運用相当の機能

* RBAC / 権限管理
* audit log
* server-side session
* certificate rotation
* break-glass admin login
* ユーザー管理の DB 化（initial super user の env 管理から `users` / `roles` table への移行、初期ユーザーを seed data として登録）

ユーザー管理を DB 化する場合のテーブル候補:

```sql
create table users (
  id text primary key,
  email text not null unique,
  display_name text,
  role text not null default 'operator',
  created_at text not null,
  updated_at text not null
);
```

---

## Appendix: 用語

| 用語            | 意味                                                     |
| ------------- | ------------------------------------------------------ |
| SSO           | Single Sign-On。一度の認証で複数サービスを利用できる仕組み                   |
| SAML          | SSO を実現するための XML ベースのプロトコル                             |
| SP            | Service Provider。ログインさせてもらうアプリケーション側                   |
| IdP           | Identity Provider。ユーザーを認証する側                           |
| ACS URL       | Assertion Consumer Service URL。SAML Response を受け取る URL |
| Entity ID     | SP または IdP を識別する ID                                    |
| Metadata URL  | SP の設定情報を XML として提供する URL                              |
| SAML Response | IdP から SP に返される認証結果                                    |
| Assertion     | SAML Response に含まれる認証・属性情報                             |
| NameID        | ユーザー識別子                                                |
| Attribute     | email、name、group などのユーザー属性                             |
