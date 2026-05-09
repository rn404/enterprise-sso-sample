
# Track A: Enterprise SSO / Identity Federation

- A1. Single-tenant SAML SSO
- A2. Multi-tenant SAML SSO
- A3. Multi-protocol Enterprise SSO: SAML / OIDC
- A4. JIT provisioning and account linking
- A5. SCIM provisioning
- A6. Enterprise SSO migration


# Track B: Application AuthN/AuthZ Fundamentals

- B1. Cookie-based application session
- B2. Redis-backed server-side session
- B3. JWT-based session
- B4. Session strategy comparison
- B5. User / role / permission model
- B6. RBAC for admin applications
- B7. Audit log and authorization checks


# Track C: OAuth / API Authorization

- C1. OAuth 2.0 mental model
- C2. Authorization Code Flow
- C3. OIDC Login basics
- C4. Access Token and Resource Server
- C5. Refresh Token and Token Lifecycle
- C6. Client Credentials Grant
- C7. M2M Authorization Design

# Dependencies

- A1 → A2
- B1 → A4
- C1 → C2 → C3 → A3
- C4 → C6 → C7
- A4 → A5
- A2/A3/A4/A5 → A6


# Syllabus examples (draft)

学習者の関心や業務文脈から開始項目を逆引きで選べるよう、目的別の学習経路を例示するセクション。**カリキュラム整備中のため、ここに挙げるのは方向性を示す sample**。Track item が揃い実装が進んだ段階で精査する。

## "Enterprise の SSO ログイン基盤を理解したい"

最短経路: A1 → A2

OIDC まで含めて理解したい場合: A1 → A2 → C1 → C2 → C3 → A3

## "OIDC で web アプリのログインを実装したい"

C1 → C2 → C3

## "OIDC ライブラリの内部実装を保守できるようになりたい"

C1 → C2 → C3 (→ 必要に応じ A3 で SAML との比較)

## "OAuth で API 認可を扱えるようになりたい"

C1 → C2 → C4 → C6 → C7

## "アプリケーションのセッション管理戦略を選べるようになりたい"

B1 → B2 → B3 → B4

## "管理画面に user / role / permission / audit を整えたい"

B5 → B6 → B7

## "既存の Enterprise SSO を新基盤に移行したい"

A1 → A2 → A4 → A5 → A6 (必要に応じ A3 も)

## "Auth0 のような IdP の中身が何をやっているのか知りたい"

C1 → C2 → C3 → A1 → A2 → A3
