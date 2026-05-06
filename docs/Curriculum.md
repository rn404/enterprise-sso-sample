# Track A: Enterprise SSO / Identity Federation

A1. Single-tenant SAML SSO
A2. Multi-tenant SAML SSO
A3. Multi-protocol Enterprise SSO: SAML / OIDC
A4. JIT provisioning and account linking
A5. SCIM provisioning
A6. Enterprise SSO migration


# Track B: Application AuthN/AuthZ Fundamentals

B1. Cookie-based application session
B2. Redis-backed server-side session
B3. JWT-based session
B4. Session strategy comparison
B5. User / role / permission model
B6. RBAC for admin applications
B7. Audit log and authorization checks


# Track C: OAuth / API Authorization

C1. OAuth 2.0 mental model
C2. Authorization Code Flow
C3. OIDC Login basics
C4. Access Token and Resource Server
C5. Refresh Token and Token Lifecycle
C6. Client Credentials Grant
C7. M2M Authorization Design

# Dependencies

A1 → A2
B1 → A4
C1 → C2 → C3 → A3
C4 → C6 → C7
A4 → A5
A2/A3/A4/A5 → A6