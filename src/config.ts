import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function required(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`environment variable ${name} is required`);
  }
  return value;
}

export const config = {
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  port: Number(process.env.PORT ?? "3000"),
  bootstrapMode: process.env.BOOTSTRAP_MODE === "true",
  superUserEmail: process.env.SUPER_USER_EMAIL ?? "",
  sessionSecret: required("SESSION_SECRET"),
  databasePath: process.env.DATABASE_PATH ?? resolve(projectRoot, "db/app.sqlite"),
} as const;

export const samlUrls = {
  acs: `${config.baseUrl}/saml/acs`,
  metadata: `${config.baseUrl}/saml/metadata`,
  entityId: `${config.baseUrl}/saml/metadata`,
} as const;
