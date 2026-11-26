import fs from "fs";
import path from "path";
import { resolvePathWithinRoot, validateAdapterName } from "./pathSecurity.js";

/**
 * Discovers potential candidate locations for a commerce adapter
 * across development, standalone production (dist/adapters), and custom directories.
 * Strictly validates adapterName against the allowlist and enforces root containment.
 *
 * @param {string} adapterName - e.g. "medusa", "spurt"
 * @returns {string[]} Ordered list of candidate directories
 */
export function getAdapterCandidateDirectories(adapterName) {
  const key = validateAdapterName(adapterName);
  if (!key) return [];

  const cwd = process.cwd();
  const rootDirs = [];

  // Custom environment path
  if (process.env.COMMERCE_ADAPTERS_DIR) {
    rootDirs.push(process.env.COMMERCE_ADAPTERS_DIR);
  }
  if (process.env.ADAPTERS_DIR) {
    rootDirs.push(process.env.ADAPTERS_DIR);
  }

  const isDistMode =
    path.basename(cwd) === "dist" ||
    fs.existsSync(path.resolve(cwd, "server.js")) ||
    process.env.STANDALONE === "true";

  if (isDistMode) {
    // In standalone dist mode, external pluggable adapters live strictly in ./adapters (dist/adapters)
    rootDirs.push(path.resolve(cwd, "adapters"));
  } else if (process.env.NODE_ENV === "development") {
    // In local dev mode, prefer root /adapters (manual drop-in) or src/adapters (dev ESM sources)
    rootDirs.push(path.resolve(cwd, "adapters"));
    rootDirs.push(path.resolve(cwd, "src", "adapters"));
  } else {
    // In next start production mode, check root /adapters, dist/adapters, dist-adapter, or src/adapters
    rootDirs.push(path.resolve(cwd, "adapters"));
    rootDirs.push(path.resolve(cwd, "dist", "adapters"));
    rootDirs.push(path.resolve(cwd, "dist-adapter"));
    rootDirs.push(path.resolve(cwd, "src", "adapters"));
  }

  const list = rootDirs
    .map((root) => resolvePathWithinRoot(root, key))
    .filter(Boolean);

  // Deduplicate
  return Array.from(new Set(list));
}

/**
 * Locates the actual adapter directory on disk.
 * Must contain either index.js, adapter.json, or domain adapter files.
 *
 * @param {string} adapterName
 * @returns {string|null} Resolved path or null
 */
export function findAdapterDir(adapterName) {
  const candidates = getAdapterCandidateDirectories(adapterName);

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) {
        const stat = fs.statSync(dir);
        if (stat.isDirectory()) {
          const files = fs.readdirSync(dir);
          const hasEntry = files.some((f) =>
            /^(index\.(jsx?|cjs|mjs)|adapter\.json|.*-product\.adapter\.js)$/i.test(f)
          );
          if (hasEntry) {
            return dir;
          }
        }
      }
    } catch {
      // Continue checking
    }
  }

  return null;
}
