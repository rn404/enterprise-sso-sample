# enterprise-sso-sample Design Doc

## 1. 目的

`enterprise-sso-sample` は、社内オペレーター向け Admin アプリケーションに Enterprise SSO を導入する構造を理解するためのサンプルアプリケーションである。

最初の対象は **SAML SSO** とし、以下を実際に動かしながら理解することを目的とする。

- Admin アプリケーション側が Service Provider（SP）として振る舞う流れ
- 社内 Identity Provider（IdP）の設定値を Admin アプリケーションに登録する流れ
- SP 側から IdP に登録する ACS URL / Entity ID / Metadata URL の意味
- SAML Response を受け取り、検証し、Admin 用アプリケーションセッションへ変換する流れ
- SAML SSO によってオペレーション画面を保護する基本構造

将来的には OIDC SSO との比較も追加できる構成にする。

---

## 2. 前提

このサンプルアプリケーションは、顧客向け SaaS の利用者画面ではなく、**自社オペレーターが利用する Internal Admin Area** を想定する。

```text
enterprise-sso-sample = SP / Service Provider
Auth0 = IdP / Identity Provider
Admin operator = Auth0 経由で SAML SSO ログインする利用者
```

本番環境では、オペレーション画面は自社のセキュリティ管理・権限管理・監査ログの配下に置かれるべきである。本サンプルでは、その入口として SAML SSO を実装する。

---

## 3. スコープ

### 3.1 対象範囲

初期バージョンでは以下を実装する。

- Operator ログイン画面
- SAML login endpoint
- SAML ACS endpoint
- SP metadata endpoint
- SAML settings 画面
- SP 設定値の表示
- IdP Metadata XML の登録
- SAML Response の検証
- オペレーション画面用アプリケーションセッションの発行
- ログイン後ダッシュボード
- ログイン中オペレーター情報表示画面
- ログアウト

### 3.2 対象外

初期バージョンでは以下は対象外とする。

- 顧客向け Service 画面
- 顧客企業ごとの複数 SAML connection 管理
- テナント別SSO設定
- 本番利用可能な認証基盤としての堅牢化
- SCIM によるユーザープロビジョニング
- IdP-initiated SSO の完全対応
- SAML Single Logout の完全対応
- OIDC SSO の実装
- MFA 制御
- RBAC / ABAC の本格実装
- 証明書ローテーション管理

---

## 4. 想定ユースケース

### 4.1 初期設定: Admin アプリに IdP 情報を登録する

1. 開発者がアプリケーションをローカル起動する
2. `/saml-settings` にアクセスする
3. SP 側設定として ACS URL / Entity ID / Metadata URL を確認する
4. Auth0 の SAML2 Web App Addon に SP 側設定値を登録する
5. Auth0 から IdP Metadata XML を取得する
6. `/saml-settings` に IdP Metadata XML を貼り付ける
7. SAML 設定を保存する
8. SAML SSO ログインをテストする

### 4.2 Admin operator が SAML SSO でログインする

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

---

## 5. 用語

| 用語          | 意味                                                        |
| ------------- | ----------------------------------------------------------- |
| SSO           | Single Sign-On。一度の認証で複数サービスを利用できる仕組み  |
| SAML          | SSOを実現するためのXMLベースのプロトコル                    |
| SP            | Service Provider。ログインさせてもらうアプリケーション側    |
| IdP           | Identity Provider。ユーザーを認証する側                     |
| ACS URL       | Assertion Consumer Service URL。SAML Response を受け取るURL |
| Entity ID     | SPまたはIdPを識別するID                                     |
| Metadata URL  | SPの設定情報をXMLとして提供するURL                          |
| SAML Response | IdPからSPに返される認証結果                                 |
| Assertion     | SAML Response に含まれる認証・属性情報                      |
| NameID        | ユーザー識別子                                              |
| Attribute     | email, name, group などのユーザー属性                       |

---

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

### 6.2 初期技術構成

- Runtime: Node.js
- Web framework: Hono
- Database: SQLite
- SAML library: `@node-saml/node-saml`
- Session: signed cookie based session
- IdP for demo: Auth0

### 6.3 URL生成方針

ローカル実行とトンネル公開の両方に対応するため、SP側URLは `BASE_URL` から生成する。

```env
BASE_URL=http://localhost:3000
```

ngrok などを使う場合:

```env
BASE_URL=https://xxxx.ngrok-free.app
```

生成されるSP設定値:

```text
ACS URL:      ${BASE_URL}/saml/acs
Entity ID:    ${BASE_URL}/saml/metadata
Metadata URL: ${BASE_URL}/saml/metadata
```

---

## 7. 画面設計

このアプリケーション自体をオペレーション画面として構成するため、`/admin` prefix は使わない。

ログイン後のメイン画面は `/` とする。

未ログインで保護対象ページにアクセスした場合は、原則として `/login` にリダイレクトする。ただし、初期セットアップ用の `BOOTSTRAP_MODE=true` の間だけ、`/saml-settings` は未ログインでもアクセスできる。

### 7.1 ダッシュボード

Path: `/`

表示内容:

- ログイン済みであること
- operator の email / NameID の概要
- `/me` へのリンク
- `/saml-settings` へのリンク
- Logout ボタン
- `BOOTSTRAP_MODE=true` の場合は、初期セットアップモード中であることと、設定完了後に `BOOTSTRAP_MODE=false` へ切り替える必要があることを表示する

未ログインの場合は `/login` にリダイレクトする。

### 7.2 ログイン画面

Path: `/login`

表示内容:

```text
Enterprise SSO Sample

[ Continue with SSO ]
```

SAML settings が未設定の場合は、設定画面への導線を表示する。

### 7.3 Operator 情報表示

Path: `/me`

表示内容:

- NameID
- email
- attributes
- session created at
- raw profile for debug

### 7.4 SAML settings

Path: `/saml-settings`

初期セットアップ時は `BOOTSTRAP_MODE=true` の場合に限り、未ログインでもアクセスできる。

SAML settings 登録後は `BOOTSTRAP_MODE=false` にし、以後はSAMLログイン済み、かつ `SUPER_USER_EMAIL` と一致するユーザーのみアクセスできる。

表示内容:

#### SP Settings

IdP に登録する値を表示する。

```text
ACS URL
http://localhost:3000/saml/acs

Entity ID
http://localhost:3000/saml/metadata

Metadata URL
http://localhost:3000/saml/metadata
```

#### IdP Settings

Auth0 から取得した IdP Metadata XML を貼り付ける。

```text
IdP Metadata XML
[ textarea ]

[ Save ]
```

保存後、metadata から以下を抽出して表示する。

```text
IdP Entity ID
IdP SSO URL
IdP Certificate registered: yes / no
Enabled: yes / no
```

#### Test login

```text
[ Test SSO Login ]
```

---

## 8. エンドポイント設計

| Method | Path                          | 目的                                                       |
| ------ | ----------------------------- | ---------------------------------------------------------- |
| GET    | `/`                           | ダッシュボード。未ログインの場合は `/login` にリダイレクト |
| GET    | `/login`                      | Operator ログイン画面                                      |
| GET    | `/saml/login`                 | SAML Request を生成してIdPへリダイレクト                   |
| POST   | `/saml/acs`                   | SAML Response を受け取る                                   |
| GET    | `/saml/metadata`              | SP metadata XML を返す                                     |
| GET    | `/me`                         | ログイン中 operator 情報を表示                             |
| GET    | `/saml-settings`              | SAML settings 表示                                         |
| POST   | `/saml-settings/idp-metadata` | IdP Metadata XML 登録                                      |
| POST   | `/logout`                     | Admin セッション破棄                                       |

---

## 9. データモデル

初期実行時は、SAML settings を登録するための bootstrap mode を用意する。

`BOOTSTRAP_MODE=true` の間だけ `/saml-settings` を未ログインでも開けるようにし、最初の IdP Metadata XML を登録できるようにする。

SAML settings 登録後は `BOOTSTRAP_MODE=false` に切り替え、SAML settings を編集できる Super user 相当の初期ユーザーのみがログインできる状態にする。

この初期ユーザーは学習用として環境変数から読み込む。DBにはユーザー本体を永続化せず、アプリケーション起動時に許可された初期ユーザーとして扱う。

```env
BOOTSTRAP_MODE=true
SUPER_USER_EMAIL=operator@example.com
```

`BOOTSTRAP_MODE=false` の状態では、SAML SSO 成功後に取得した email または NameID が `SUPER_USER_EMAIL` と一致する場合のみ、初期ログインを許可する。

将来的に複数ユーザー・権限管理を扱う場合は、`users` table と `roles` table を追加し、初期ユーザーを seed data として登録する。

### 9.1 saml_settings

初期実装では SAML 設定は1つだけ保持する。

```sql
create table saml_settings (
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
```

### 9.2 initial super user

初期実装では、Super user 相当の初期ユーザーはDBではなく環境変数で管理する。

```text
SUPER_USER_EMAIL=operator@example.com
```

ログイン許可条件:

```text
SAML Response から取得した email または NameID が SUPER_USER_EMAIL と一致すること
```

この制約により、SAML settings 画面へアクセスできるユーザーを最小限に絞る。

将来的にユーザー管理をDB化する場合の候補:

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

### 9.3 application session

学習用の初期実装ではDBには保存せず、署名付きcookieに最小限の情報を保持する。

保持する情報:

```json
{
  "nameId": "operator@example.com",
  "email": "operator@example.com",
  "attributes": {},
  "createdAt": "2026-04-25T00:00:00.000Z"
}
```

---

## 10. 初期セットアップフロー

```text
BOOTSTRAP_MODE=true
  |
  | access /saml-settings without login
  | show SP settings
  | configure Auth0 SAML2 Web App Addon
  | paste IdP Metadata XML
  | save saml_settings
  v
Set BOOTSTRAP_MODE=false
  |
  | access /login
  | login with SAML as SUPER_USER_EMAIL
  v
Redirect /
```

bootstrap mode は学習用の初期設定を簡単にするための仕組みであり、本番では別の安全な初期化手段を用意する。

---

## 11. SAMLログインフロー

```text
GET /saml/login
  |
  | load saml_settings
  | ensure enabled
  | build SAML settings
  | generate authorize URL
  v
Redirect to IdP SSO URL
  |
  | operator authenticates at IdP
  v
POST /saml/acs
  |
  | parse SAMLResponse
  | validate signature
  | validate issuer
  | validate audience
  | validate expiration
  | extract NameID and attributes
  | create admin session
  v
Redirect /
```

---

## 12. Auth0 設定メモ

Auth0 は IdP として利用する。

Auth0 側では Regular Web Application を作成し、SAML2 Web App Addon を有効化する。

Auth0 に登録する値:

```text
Application Callback URL:
${BASE_URL}/saml/acs
```

SAML2 Web App Addon Settings 例:

```json
{
  "audience": "${BASE_URL}/saml/metadata",
  "recipient": "${BASE_URL}/saml/acs",
  "destination": "${BASE_URL}/saml/acs",
  "mappings": {
    "email": "email",
    "name": "name",
    "given_name": "given_name",
    "family_name": "family_name"
  },
  "nameIdentifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "nameIdentifierProbes": ["email"]
}
```

Auth0 から取得してアプリに登録する値:

```text
IdP Metadata XML
```

アプリ側では Metadata XML から以下を抽出する。

```text
IdP Entity ID
SingleSignOnService Location
X509Certificate
```

---

## 13. 検証観点

SAML Response 受信時に最低限以下を確認する。

- 署名が正しいこと
- IdP Entity ID が登録値と一致すること
- Audience がSP Entity IDと一致すること
- ACS URL が想定された宛先であること
- Assertion が有効期限内であること
- NameID または email attribute が取得できること

学習用として、以下の失敗パターンを確認する。

- 証明書を間違える
- ACS URL を間違える
- Entity ID / Audience を間違える
- email attribute を消す
- SAML settings disabled の状態でログインしようとする
- `BASE_URL` と Auth0 側設定を一致させない

---

## 14. セキュリティ上の注意

このアプリケーションは学習用サンプルであり、本番利用を想定しない。

ただし、以下は学習上重要なため明示的に扱う。

- SAML Response を署名検証なしで信用しない
- XML署名検証は自前実装しない
- SAML Response のログ出力は学習用途に限定する
- cookieには署名を付ける
- 本番ではcookieに生のattributesを保持しない
- 本番ではHTTPSを前提にする
- 本番では証明書ローテーションを考慮する
- 本番ではセッション管理をサーバサイドに寄せる
- 初期実装では `SUPER_USER_EMAIL` に一致するユーザーのみ `/saml-settings` を操作できる
- 本番では `/saml-settings` は厳格な権限制御の配下に置く
- 本番では監査ログを記録する

---

## 15. 実装ステップ

### Step 1: プロジェクト初期化

- Node.js + TypeScript + Hono のセットアップ
- SQLite のセットアップ
- 基本ルーティング作成
- `BASE_URL` 設定

### Step 2: SAML settings 画面

- SP設定値の表示
- IdP Metadata XML 貼り付け
- Metadata XML のパース
- `saml_settings` への保存

### Step 3: SP metadata endpoint

- `/saml/metadata` を実装
- Entity ID / ACS URL を含む metadata XML を返す

### Step 4: SAML login endpoint

- `/saml/login` を実装
- SAML Request を生成
- IdP SSO URL へリダイレクト

### Step 5: ACS endpoint

- `/saml/acs` を実装
- SAML Response を受信
- 検証
- operator 情報抽出
- admin session 発行

### Step 6: ダッシュボード画面

- `/` をダッシュボードとして実装
- `/me` を実装
- `BOOTSTRAP_MODE=true` の場合はダッシュボード上に初期セットアップモード中であることを表示する
- session middleware で保護対象ページを制御し、未ログイン時は `/login` にリダイレクト
- `BOOTSTRAP_MODE=true` の場合のみ `/saml-settings` を未ログインアクセス可能にする

### Step 7: 失敗パターンの確認

- 証明書不一致
- Audience不一致
- ACS URL不一致
- settings disabled
- `BASE_URL` 不一致

---

## 16. 将来拡張

### 15.1 OIDC SSO の追加

将来的に以下を追加し、SAMLとの比較を可能にする。

- OIDC settings 画面
- client_id / client_secret / issuer / discovery URL の登録
- authorization code flow
- ID Token 検証
- SAML settings との比較画面

### 15.2 複数IdP対応

将来的に複数の社内IdPや環境差分を扱う場合、以下を検討する。

- 複数 SAML settings
- environment ごとの設定
- IdP selection

### 15.3 本番運用寄りの機能

- RBAC
- audit log
- server-side session
- certificate rotation
- metadata refresh
- break-glass admin login

---

## 17. 初期ゴール

初期ゴールは以下とする。

```text
Auth0をIdPとして設定し、
enterprise-sso-sampleをSPとして動かし、
SAML SSOで `/` のダッシュボードにログインできること。
```

これにより、SAML SSOにおける以下の関係を理解できる状態にする。

- SPがIdPに渡す設定値
- SPがIdPから受け取る設定値
- SAML Request / Response の流れ
- SAML認証結果とAdminアプリケーション内セッションの違い
- Admin画面をEnterprise SSOで保護する基本構造
