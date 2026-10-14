/* global console, process */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const target = "lgjujyaclrpaopdabyzg";
const files = [
  "0023_enforce_active_account_access.sql",
  "0024_governed_lesson_bookmarks.sql",
  "0025_guard_simulation_persistence.sql"
];
const expected = Array.from({ length: 22 }, (_, i) =>
  String(i + 1).padStart(4, "0")
).filter((v) => v !== "0010");
/** @param {string} value */
const quote = (value) => `'${value.replaceAll("'", "''")}'`;
try {
  const args = process.argv.slice(2);
  const envIndex = args.indexOf("--config-file");
  if (envIndex < 0 || !args[envIndex + 1])
    throw new Error(
      "An explicit private --config-file is required. No database contacted."
    );
  const apply = args.includes("--apply");
  if (
    apply &&
    process.env.INDUSTRIAL_LEARN_APPROVE_STAGING_MIGRATIONS !== "0023,0024,0025"
  ) {
    throw new Error(
      "Operator approval for staging migrations 0023,0024,0025 is required. No database contacted."
    );
  }
  const env = parseEnv(readFileSync(resolve(args[envIndex + 1]), "utf8"));
  if (
    env.NEXT_PUBLIC_APP_ENV !== "staging" ||
    env.INDUSTRIAL_LEARN_AUTH_MODE !== "supabase" ||
    env.INDUSTRIAL_LEARN_E2E !== "false" ||
    env.SUPABASE_PROJECT_REF !== target ||
    new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname !== `${target}.supabase.co`
  )
    throw new Error("Dedicated staging target guard failed. No database contacted.");
  const database = new URL(env.SUPABASE_DB_URL ?? "");
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !(
      database.hostname === `db.${target}.supabase.co` ||
      (database.hostname.endsWith(".pooler.supabase.com") &&
        decodeURIComponent(database.username) === `postgres.${target}`)
    )
  )
    throw new Error("Database target guard failed. No database contacted.");
  const migrations = files.map((file) => {
    const sql = readFileSync(resolve("database/migrations", file), "utf8");
    return {
      file,
      version: file.slice(0, 4),
      sql,
      sha256: createHash("sha256").update(sql).digest("hex")
    };
  });
  /** @param {string} input */
  function execute(input) {
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
      input,
      encoding: "utf8",
      timeout: 180000
    });
    if (result.status !== 0)
      throw new Error(
        "Staging command failed or its outcome is uncertain. Do not retry apply. Inspect the migration ledger through the operator's secure database console before taking another action. Diagnostics withheld."
      );
    return result.stdout.trim();
  }
  /** @type {unknown} */
  const ledger = JSON.parse(
    execute(
      "begin read only; set local statement_timeout='15s'; select coalesce(json_agg(version order by version),'[]'::json) from supabase_migrations.schema_migrations; commit;"
    )
  );
  if (JSON.stringify(ledger) !== JSON.stringify(expected))
    throw new Error(
      "Migration history differs from the reviewed baseline through 0022 (0010 held). Stop; no migrations applied."
    );
  console.log(
    JSON.stringify({
      target,
      mode: apply ? "approved-apply" : "read-only-dry-run",
      baseline: ledger,
      pending: migrations.map(({ file, sha256 }) => ({ file, sha256 })),
      dataEffects:
        "No record backfill, reassociation, deletion, publication or approval. Existing bookmarks remain unchanged."
    })
  );
  if (apply) {
    const statements = migrations
      .map(
        ({ version, file, sql }) =>
          `${sql}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values (${quote(version)},${quote(file.slice(5, -4))},array[${quote(sql)}]);`
      )
      .join("\n");
    execute(
      `begin; set local lock_timeout='5s'; set local statement_timeout='60s'; select pg_advisory_xact_lock(hashtextextended('industrial-learn-53f-migrations',0));\ndo $$ begin if (select array_agg(version order by version) from supabase_migrations.schema_migrations) is distinct from array[${expected.map(quote).join(",")}]::text[] then raise exception 'Migration history changed'; end if; end $$;\n${statements}\ncommit;`
    );
    console.log(
      "APPLIED: staging migrations 0023–0025 committed atomically. Ordinary-user and deployed verification are still required."
    );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Configuration failure";
  console.error(
    /URL|ENOENT|ENOTDIR/.test(message)
      ? "Private staging configuration could not be read. No migration applied."
      : message
  );
  process.exitCode = 1;
}
