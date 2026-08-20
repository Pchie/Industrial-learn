/* global console, process */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const ignoredFiles = new Set(["package-lock.json"]);

const scannedExtensions = new Set([
  ".css",
  ".env",
  ".example",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml"
]);

const secretPatterns = [
  {
    name: "Supabase service-role key with value",
    pattern: /^\s*(?:export\s+)?SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/i
  },
  {
    name: "Private key material",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/
  },
  {
    name: "OpenAI-style API key",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/
  },
  {
    name: "JWT-like bearer token",
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/
  },
  {
    name: "Generic assigned secret value",
    pattern:
      /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token)\b\s*[:=]\s*["'][A-Za-z0-9+/=_-]{20,}["']/i
  }
];

/** @type {{ file: string; line: number; name: string }[]} */
const findings = [];

for (const relativePath of listScannableFiles()) {
  const content = readFileSync(join(root, relativePath), "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (isAllowedPlaceholder(relativePath, line)) {
      return;
    }

    for (const secretPattern of secretPatterns) {
      if (secretPattern.pattern.test(line)) {
        findings.push({
          file: relativePath,
          line: index + 1,
          name: secretPattern.name
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Potential secret values were found:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.name}`);
  }
  process.exit(1);
}

console.log("Secret scan passed: no obvious committed secret values found.");

/**
 * @returns {string[]}
 */
function listScannableFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" }
  );

  return output
    .split("\0")
    .filter(Boolean)
    .filter((relativePath) => existsSync(join(root, relativePath)))
    .filter((relativePath) => !ignoredFiles.has(relativePath))
    .filter(shouldScan);
}

/** @param {string} fileName */
function shouldScan(fileName) {
  if (fileName.startsWith(".env")) {
    return true;
  }

  const extensionMatch = fileName.match(/(\.[^.]+)$/);
  return extensionMatch ? scannedExtensions.has(extensionMatch[1]) : false;
}

/**
 * @param {string} relativePath
 * @param {string} line
 */
function isAllowedPlaceholder(relativePath, line) {
  const trimmed = line.trim();

  if (relativePath === ".env.example" && /^[A-Z0-9_]+=/.test(trimmed)) {
    const [, value = ""] = trimmed.split("=");
    return value.trim() === "";
  }

  return (
    trimmed.includes("SUPABASE_SERVICE_ROLE_KEY=") &&
    !trimmed.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/)
  );
}
