import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "schema.sql");
const dbPath = process.env.DATABASE_PATH ?? resolve(here, "../../db/app.sqlite");

const schema = readFileSync(schemaPath, "utf-8");
const db = new DatabaseSync(dbPath);
try {
  db.exec(schema);
  console.log(`schema applied to ${dbPath}`);
} finally {
  db.close();
}
