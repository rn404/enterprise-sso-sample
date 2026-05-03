import { SAML, type SamlConfig } from "@node-saml/node-saml";

import { samlUrls } from "../config";
import type { SamlSettings } from "./settings-store";

export class SamlConfigError extends Error {}

export function buildSamlClient(settings: SamlSettings): SAML {
  if (!settings.enabled) {
    throw new SamlConfigError("SAML 設定が無効です (enabled = false)");
  }
  if (!settings.idpSsoUrl) {
    throw new SamlConfigError("IdP SSO URL が未設定です");
  }
  if (!settings.idpCertificate) {
    throw new SamlConfigError("IdP 証明書が未設定です");
  }

  const config: SamlConfig = {
    entryPoint: settings.idpSsoUrl,
    issuer: samlUrls.entityId,
    callbackUrl: samlUrls.acs,
    audience: samlUrls.entityId,
    idpCert: toPemCertificate(settings.idpCertificate),
    identifierFormat: settings.nameIdFormat ?? null,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
  };

  return new SAML(config);
}

function toPemCertificate(base64: string): string {
  const compact = base64.replace(/\s+/g, "");
  const wrapped = compact.match(/.{1,64}/g)?.join("\n") ?? compact;
  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`;
}
