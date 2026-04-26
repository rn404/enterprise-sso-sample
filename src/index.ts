import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { config, samlUrls } from "./config";

const app = new Hono();

app.get("/", (c) => c.text("TODO: dashboard"));
app.get("/login", (c) => c.text("TODO: login screen"));

app.get("/saml/login", (c) => c.text("TODO: build SAML Request and redirect"));
app.post("/saml/acs", (c) => c.text("TODO: receive SAML Response"));
app.get("/saml/metadata", (c) => c.text("TODO: SP metadata XML"));

app.get("/me", (c) => c.text("TODO: operator profile"));

app.get("/saml-settings", (c) => c.text("TODO: SAML settings page"));
app.post("/saml-settings/idp-metadata", (c) => c.text("TODO: save IdP metadata"));

app.post("/logout", (c) => c.text("TODO: destroy admin session"));

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`enterprise-sso-sample listening on ${config.baseUrl}`);
  console.log(`  bound port: ${info.port}`);
  console.log(`  bootstrap mode: ${config.bootstrapMode}`);
  console.log(`  ACS URL: ${samlUrls.acs}`);
  console.log(`  Entity ID / Metadata URL: ${samlUrls.metadata}`);
});
