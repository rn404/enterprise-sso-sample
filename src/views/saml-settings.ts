import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

import { samlUrls } from "../config";
import type { SamlSettings } from "../saml/settings-store";

type RenderOptions = {
  settings: SamlSettings | null;
  bootstrapMode: boolean;
  flash?: { kind: "success" | "error"; message: string } | null;
};

export function renderSamlSettingsPage(
  opts: RenderOptions,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const { settings, bootstrapMode, flash } = opts;
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>SAML settings - enterprise-sso-sample</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            max-width: 720px;
            margin: 2rem auto;
            padding: 0 1rem;
            line-height: 1.6;
          }
          h1 {
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.5rem;
          }
          h2 {
            margin-top: 2rem;
          }
          pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
          }
          code {
            background: #f5f5f5;
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
          }
          textarea {
            width: 100%;
            min-height: 12rem;
            font-family: monospace;
          }
          .flash {
            padding: 0.75rem 1rem;
            border-radius: 4px;
            margin: 1rem 0;
          }
          .flash.success {
            background: #e6f4ea;
            color: #1e4620;
          }
          .flash.error {
            background: #fce8e6;
            color: #5b1112;
          }
          .badge {
            display: inline-block;
            padding: 0.1rem 0.5rem;
            border-radius: 999px;
            font-size: 0.85em;
          }
          .badge.on {
            background: #1e8e3e;
            color: white;
          }
          .badge.off {
            background: #888;
            color: white;
          }
          .note {
            background: #fff8e1;
            padding: 0.75rem 1rem;
            border-left: 4px solid #f9a825;
            margin: 1rem 0;
          }
        </style>
      </head>
      <body>
        <h1>SAML settings</h1>

        ${bootstrapMode
          ? html`<div class="note">
              <strong>BOOTSTRAP_MODE=true</strong>: 初期セットアップモード中。設定保存後は
              <code>BOOTSTRAP_MODE=false</code> に切り替えてください。
            </div>`
          : ""}
        ${flash ? html`<div class="flash ${flash.kind}">${flash.message}</div>` : ""}

        <h2>SP settings</h2>
        <p>以下の値を IdP（Auth0 SAML2 Web App Addon）に登録します。</p>
        <pre>
ACS URL
${samlUrls.acs}

Entity ID
${samlUrls.entityId}

Metadata URL
${samlUrls.metadata}</pre
        >

        <h2>IdP settings</h2>
        ${settings
          ? renderCurrentSettings(settings)
          : html`<p>未設定です。下のフォームから IdP Metadata XML を登録してください。</p>`}

        <h3>IdP Metadata XML を登録 / 更新</h3>
        <form method="post" action="/saml-settings/idp-metadata">
          <textarea
            name="idp_metadata_xml"
            placeholder='<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ...>'
            required
          ></textarea>
          <p><button type="submit">Save</button></p>
        </form>

        <h2>Test login</h2>
        <p><a href="/saml/login">Test SSO Login</a>（settings 保存後に有効）</p>

        <hr />
        <p><a href="/">← back to dashboard</a></p>
      </body>
    </html>`;
}

function renderCurrentSettings(
  settings: SamlSettings,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const enabledBadge = settings.enabled
    ? html`<span class="badge on">enabled</span>`
    : html`<span class="badge off">disabled</span>`;
  return html`
    <p>${enabledBadge} updated at ${settings.updatedAt}</p>
    <pre>
IdP Entity ID
${settings.idpEntityId ?? "(none)"}

IdP SSO URL
${settings.idpSsoUrl ?? "(none)"}

IdP Certificate registered: ${settings.idpCertificate ? "yes" : "no"}

NameID Format
${settings.nameIdFormat ?? "(none)"}</pre
    >
  `;
}
