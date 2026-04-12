import pg from "pg";
import { readFile } from "node:fs/promises";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function checkDbConnection() {
  await query("SELECT 1");
}

export async function runSchemaFromFile(schemaFileUrl) {
  const sql = await readFile(schemaFileUrl, "utf8");
  await query(sql);
}
