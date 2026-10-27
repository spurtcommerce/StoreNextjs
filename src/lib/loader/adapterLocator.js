import fs from "fs";
import path from "path";

/**
 * Discovers potential candidate locations for a commerce adapter
 * across development, standalone production (dist/adapters), and custom directories.
 *
 * @param {string} adapterName - e.g. "medusa", "spurt"
 * @returns {string[]} Ordered list of candidate directories
 */
export function getAdapterCandidateDirectories(adapterName) {
  if (!adapterName) return [];
  const key = adapterName.toLowerCase().trim();
  const cwd = process.cwd();
  const list = [];

  // Custom environment path
  if (process.env.COMMERCE_ADAPTERS_DIR) {
    list.push(path.resolve(process.env.COMMERCE_ADAPTERS_DIR, key));
  }
  if (process.env.ADAPTERS_DIR) {
    list.push(path.resolve(process.env.ADAPTERS_DIR, key));
  }

  // 1. Root /adapters directory (manual drop-in)
  list.push(path.resolve(cwd, "adapters", key));

  // 2. Dist /adapters directory (standalone deployment drop-in)
  list.push(path.resolve(cwd, "dist", "adapters", key));

  // 3. Built adapter artifact directory
  list.push(path.resolve(cwd, "dist-adapter", key));

  // 4. Source adapters directory (development)
  list.push(path.resolve(cwd, "src", "adapters", key));

  // Relative to __dirname in compiled environments
  if (typeof __dirname !== "undefined") {
    list.push(path.resolve(__dirname, "../../../adapters", key));
    list.push(path.resolve(__dirname, "../../../../adapters", key));
  }

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
