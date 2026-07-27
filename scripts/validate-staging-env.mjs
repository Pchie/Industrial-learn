/* global console, process */

import { existsSync, readFileSync } from "node:fs";

/** @type {readonly string[]} */
const requiredKeys = [
  "NODE_ENV",
  "NEXT_PUBLIC_APP_ENV",
  "APP_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_URL",
  "INDUSTRIAL_LEARN_AUTH_MODE",
  "INDUSTRIAL_LEARN_E2E"
];

/** @type {Record<string, string | undefined>} */
const env = {
  ...process.env,
  ...readEnvFile(process.env.STAGING_ENV_FILE)
};

/** @type {string[]} */
const failures = [];

for (const key of requiredKeys) {
  if (!env[key]?.trim()) {
    failures.push(`${key} is required for staging.`);
  }
}

expectEqual("NODE_ENV", "production");
expectEqual("NEXT_PUBLIC_APP_ENV", "staging");
expectEqual("INDUSTRIAL_LEARN_AUTH_MODE", "supabase");

if (env.INDUSTRIAL_LEARN_E2E && env.INDUSTRIAL_LEARN_E2E !== "false") {
  failures.push("INDUSTRIAL_LEARN_E2E must be false or unset for staging runtime.");
}

const appBaseUrl = parseUrl("APP_BASE_URL", env.APP_BASE_URL);
const supabaseUrl = parseUrl("NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL);
const dbUrl = parseUrl("SUPABASE_DB_URL", env.SUPABASE_DB_URL);

if (appBaseUrl) {
  if (appBaseUrl.protocol !== "https:") {
    failures.push("APP_BASE_URL must use HTTPS for staging.");
  }
  if (isLocalHost(appBaseUrl.hostname)) {
    failures.push("APP_BASE_URL must not use a local host for staging.");
  }
}

if (supabaseUrl) {
  if (supabaseUrl.protocol !== "https:") {
    failures.push("NEXT_PUBLIC_SUPABASE_URL must use HTTPS.");
  }
  if (!supabaseUrl.hostname.endsWith(".supabase.co")) {
    failures.push("NEXT_PUBLIC_SUPABASE_URL should point to a Supabase project host.");
  }
}

if (dbUrl) {
  if (!["postgres:", "postgresql:"].includes(dbUrl.protocol)) {
    failures.push("SUPABASE_DB_URL must use a PostgreSQL connection scheme.");
  }
  if (isLocalHost(dbUrl.hostname)) {
    failures.push("SUPABASE_DB_URL must not point to a local database for staging.");
  }
}

if (env.SUPABASE_PROJECT_REF && !/^[a-z0-9]{10,}$/.test(env.SUPABASE_PROJECT_REF)) {
  failures.push("SUPABASE_PROJECT_REF must look like a Supabase project reference.");
}

if (
  supabaseUrl &&
  env.SUPABASE_PROJECT_REF &&
  !supabaseUrl.hostname.startsWith(`${env.SUPABASE_PROJECT_REF}.`)
) {
  failures.push("SUPABASE_PROJECT_REF must match NEXT_PUBLIC_SUPABASE_URL hostname.");
}

if (env.SUPABASE_SERVICE_ROLE_KEY === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  failures.push(
    "SUPABASE_SERVICE_ROLE_KEY must not equal NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

if (failures.length > 0) {
  console.error("Staging environment validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Staging environment validation passed.");
console.log("Checked required staging keys without printing secret values.");

/**
 * @param {string} key
 * @param {string} expected
 */
function expectEqual(key, expected) {
  if (env[key] && env[key] !== expected) {
    failures.push(`${key} must be ${expected} for staging.`);
  }
}

/**
 * @param {string} key
 * @param {string | undefined} value
 * @returns {URL | undefined}
 */
function parseUrl(key, value) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    failures.push(`${key} must be a valid URL.`);
    return undefined;
  }
}

/** @param {string} hostname */
function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/**
 * @param {string | undefined} filePath
 * @returns {Record<string, string>}
 */
function readEnvFile(filePath) {
  if (!filePath) {
    return {};
  }

  if (!existsSync(filePath)) {
    console.error("STAGING_ENV_FILE does not exist.");
    process.exit(1);
  }

  /** @type {Record<string, string>} */
  const parsed = {};
  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    parsed[key] = stripQuotes(value);
  }

  return parsed;
}

/**
 * @param {string} value
 * @returns {string}
 */
function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
