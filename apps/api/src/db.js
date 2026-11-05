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

export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client.query.bind(client));
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
