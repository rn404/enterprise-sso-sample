import { getDb } from "../db/client";
import type { ParsedIdpMetadata } from "./metadata-parser";

const DEFAULT_ID = "default";

export type SamlSettings = {
  id: string;
  idpEntityId: string | null;
  idpSsoUrl: string | null;
  idpCertificate: string | null;
  nameIdFormat: string | null;
  emailAttribute: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  idp_entity_id: string | null;
  idp_sso_url: string | null;
  idp_certificate: string | null;
  name_id_format: string | null;
  email_attribute: string | null;
  enabled: number;
  created_at: string;
  updated_at: string;
};

function toSettings(row: Row): SamlSettings {
  return {
    id: row.id,
    idpEntityId: row.idp_entity_id,
    idpSsoUrl: row.idp_sso_url,
    idpCertificate: row.idp_certificate,
    nameIdFormat: row.name_id_format,
    emailAttribute: row.email_attribute,
    enabled: row.enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getDefaultSamlSettings(): SamlSettings | null {
  const row = getDb().prepare("SELECT * FROM saml_settings WHERE id = ?").get(DEFAULT_ID) as
    | Row
    | undefined;
  return row ? toSettings(row) : null;
}

export function upsertDefaultSamlSettings(metadata: ParsedIdpMetadata): SamlSettings {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = getDefaultSamlSettings();

  if (existing) {
    db.prepare(
      `UPDATE saml_settings
         SET idp_entity_id = ?,
             idp_sso_url = ?,
             idp_certificate = ?,
             name_id_format = ?,
             enabled = 1,
             updated_at = ?
       WHERE id = ?`,
    ).run(
      metadata.entityId,
      metadata.ssoUrl,
      metadata.certificate,
      metadata.nameIdFormat,
      now,
      DEFAULT_ID,
    );
  } else {
    db.prepare(
      `INSERT INTO saml_settings (
         id, idp_entity_id, idp_sso_url, idp_certificate,
         name_id_format, email_attribute, enabled,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      DEFAULT_ID,
      metadata.entityId,
      metadata.ssoUrl,
      metadata.certificate,
      metadata.nameIdFormat,
      null,
      now,
      now,
    );
  }

  const saved = getDefaultSamlSettings();
  if (!saved) {
    throw new Error("failed to load saml_settings after upsert");
  }
  return saved;
}
