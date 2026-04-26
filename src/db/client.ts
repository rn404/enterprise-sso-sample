import { DatabaseSync } from "node:sqlite";

import { config } from "../config";

let instance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!instance) {
    instance = new DatabaseSync(config.databasePath);
    instance.exec("PRAGMA journal_mode = WAL;");
    instance.exec("PRAGMA foreign_keys = ON;");
  }
  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
