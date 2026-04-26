import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import { config, samlUrls } from "./config";
import { MetadataParseError, parseIdpMetadata } from "./saml/metadata-parser";
import { getDefaultSamlSettings, upsertDefaultSamlSettings } from "./saml/settings-store";
import { renderSamlSettingsPage } from "./views/saml-settings";

const SAML_SETTINGS_BODY_LIMIT = 256 * 1024;

const app = new Hono();

app.get("/", (c) => c.text("TODO: dashboard"));
app.get("/login", (c) => c.text("TODO: login screen"));

app.get("/saml/login", (c) => c.text("TODO: build SAML Request and redirect"));
app.post("/saml/acs", (c) => c.text("TODO: receive SAML Response"));
app.get("/saml/metadata", (c) => c.text("TODO: SP metadata XML"));

app.get("/me", (c) => c.text("TODO: operator profile"));

app.get("/saml-settings", (c) => {
  if (!config.bootstrapMode) {
    return c.text(
      "TODO: BOOTSTRAP_MODE=false の場合は SAML SSO ログイン + SUPER_USER_EMAIL チェックを通す",
      403,
    );
  }
  return c.html(
    renderSamlSettingsPage({
      settings: getDefaultSamlSettings(),
      bootstrapMode: config.bootstrapMode,
      flash: null,
    }),
  );
});

app.post(
  "/saml-settings/idp-metadata",
  bodyLimit({
    maxSize: SAML_SETTINGS_BODY_LIMIT,
    onError: (c) => c.text("metadata XML が大きすぎます (最大 256KB)", 413),
  }),
  async (c) => {
    if (!config.bootstrapMode) {
      return c.text(
        "TODO: BOOTSTRAP_MODE=false の場合は SAML SSO ログイン + SUPER_USER_EMAIL チェックを通す",
        403,
      );
    }
    const form = await c.req.parseBody();
    const xml = form["idp_metadata_xml"];
    if (typeof xml !== "string" || xml.trim() === "") {
      return c.html(
        renderSamlSettingsPage({
          settings: getDefaultSamlSettings(),
          bootstrapMode: config.bootstrapMode,
          flash: { kind: "error", message: "IdP Metadata XML を入力してください" },
        }),
        400,
      );
    }
    try {
      const parsed = parseIdpMetadata(xml);
      const saved = upsertDefaultSamlSettings(parsed);
      return c.html(
        renderSamlSettingsPage({
          settings: saved,
          bootstrapMode: config.bootstrapMode,
          flash: { kind: "success", message: "SAML settings を保存しました" },
        }),
      );
    } catch (e) {
      const message =
        e instanceof MetadataParseError
          ? `Metadata パース失敗: ${e.message}`
          : `保存中にエラー: ${e instanceof Error ? e.message : String(e)}`;
      return c.html(
        renderSamlSettingsPage({
          settings: getDefaultSamlSettings(),
          bootstrapMode: config.bootstrapMode,
          flash: { kind: "error", message },
        }),
        400,
      );
    }
  },
);

app.post("/logout", (c) => c.text("TODO: destroy admin session"));

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`enterprise-sso-sample listening on ${config.baseUrl}`);
  console.log(`  bound port: ${info.port}`);
  console.log(`  bootstrap mode: ${config.bootstrapMode}`);
  console.log(`  ACS URL: ${samlUrls.acs}`);
  console.log(`  Entity ID / Metadata URL: ${samlUrls.metadata}`);
});
