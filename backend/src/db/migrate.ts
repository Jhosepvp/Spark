import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { pool } from "../config/db";

const MIGRATIONS_DIR = join(__dirname, "..", "..", "db", "migrations");

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>("SELECT filename FROM schema_migrations");
  return new Set(result.rows.map((row) => row.filename));
}

async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] skipping already applied: ${file}`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`[migrate] applying: ${file}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`[migrate] applied: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  console.log("[migrate] done");
}

runMigrations()
  .then(() => pool.end())
  .catch((err) => {
    console.error("[migrate] failed", err);
    pool.end().finally(() => process.exit(1));
  });
