/* global console, process */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

// Deliberately fixed to the approved staging project; never infer a production target.
const stagingRef = "lgjujyaclrpaopdabyzg";
const root = process.cwd();
const envFile = process.env.STAGING_ENV_FILE;

try {
  if (!envFile) throw new Error("Set STAGING_ENV_FILE to the ignored staging env file.");
  const env = parseEnv(readFileSync(resolve(root, envFile), "utf8"));
  if (
    env.SUPABASE_PROJECT_REF !== stagingRef ||
    env.NEXT_PUBLIC_APP_ENV !== "staging" ||
    env.INDUSTRIAL_LEARN_AUTH_MODE !== "supabase" ||
    env.INDUSTRIAL_LEARN_E2E !== "false" ||
    new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname !== `${stagingRef}.supabase.co`
  ) {
    throw new Error("Staging identity guard failed.");
  }
  const database = new URL(env.SUPABASE_DB_URL ?? "");
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !(
      database.hostname === `db.${stagingRef}.supabase.co` ||
      (database.hostname.endsWith(".pooler.supabase.com") &&
        decodeURIComponent(database.username) === `postgres.${stagingRef}`)
    )
  ) {
    throw new Error("Database target guard failed.");
  }
  const fixture = readFileSync(
    resolve(root, "database/tests/publication-evidence.rollback.sql"),
    "utf8"
  );
  const result = spawnSync("psql", ["-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1"], {
    env: {
      PATH: process.env.PATH,
      PGHOST: database.hostname,
      PGPORT: database.port || "5432",
      PGDATABASE: database.pathname.slice(1) || "postgres",
      PGUSER: decodeURIComponent(database.username),
      PGPASSWORD: decodeURIComponent(database.password),
      PGSSLMODE: "require",
      PGCONNECT_TIMEOUT: "15"
    },
    input: `begin;\nset local statement_timeout = '30s';\n${fixture}\nrollback;`,
    encoding: "utf8",
    timeout: 60000
  });
  if (result.status !== 0) {
    throw new Error(
      "Staging publication regression failed. Transaction closed without commit. Database diagnostics are withheld to avoid exposing connection details."
    );
  }
  console.log(result.stdout.trim());
  console.log("PASS: staging-only regression rolled back; no test records retained.");
} catch (error) {
  console.error(
    error instanceof Error && !/URL|ENOENT/.test(error.message)
      ? error.message
      : "Staging configuration could not be read. No database change was committed."
  );
  process.exitCode = 1;
}
