create table if not exists saml_settings (
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
