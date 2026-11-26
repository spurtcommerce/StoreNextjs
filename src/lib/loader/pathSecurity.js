import fs from "fs";
import path from "path";
import { CANONICAL_TEMPLATES } from "../../app/manage/_lib/constants.js";

export const SAFE_SLUG_REGEX = /^[a-z0-9-]+$/;

export const KNOWN_ADAPTERS = new Set([
  "medusa",
  "spurt",
  "opencart",
  "woocommerce",
]);

export const KNOWN_TEMPLATES = new Set(
  CANONICAL_TEMPLATES.map((t) => t.id.toLowerCase())
);

/**
 * Validates an adapter name against a strict slug pattern and the known adapter allowlist.
 * Returns the normalized adapter name or null if rejected.
 */
export function validateAdapterName(name) {
  if (typeof name !== "string") return null;
  const normalized = name.toLowerCase().trim();
  if (!SAFE_SLUG_REGEX.test(normalized)) return null;
  if (KNOWN_ADAPTERS.has(normalized)) return normalized;

  // Also allow valid adapter folders physically present on disk
  try {
    const cwd = process.cwd();
    const isDist =
      path.basename(cwd) === "dist" ||
      fs.existsSync(path.resolve(cwd, "server.js")) ||
      process.env.STANDALONE === "true";
    const candidates = isDist
      ? [path.join(cwd, "adapters", normalized)]
      : [
          path.join(cwd, "adapters", normalized),
          path.join(cwd, "src", "adapters", normalized),
        ];
    if (candidates.some((p) => fs.existsSync(p) && fs.statSync(p).isDirectory())) {
      return normalized;
    }
  } catch {}

  return null;
}

/**
 * Validates a template name against a strict slug pattern and the known template allowlist.
 * Returns the normalized template name or null if rejected.
 */
export function validateTemplateName(name) {
  if (typeof name !== "string") return null;
  const normalized = name.toLowerCase().trim();
  if (!SAFE_SLUG_REGEX.test(normalized)) return null;
  if (KNOWN_TEMPLATES.has(normalized)) return normalized;

  // Also allow dynamically if folder exists in templates/
  try {
    const cwd = process.cwd();
    if (
      fs.existsSync(path.join(cwd, "templates", normalized)) ||
      fs.existsSync(path.join(cwd, "dist", "templates", normalized))
    ) {
      return normalized;
    }
  } catch {}

  return null;
}

/**
 * Validates a relative component/module file path inside a template folder.
 * Rejects absolute paths, traversal segments, backslashes, and unsafe characters.
 */
export function validateRelativeTemplateFilePath(filePath) {
  if (typeof filePath !== "string") return null;
  const trimmed = filePath.trim();
  if (!trimmed || trimmed.startsWith("/") || trimmed.includes("\\")) return null;
  const segments = trimmed.split("/");
  if (segments.some((seg) => !seg || seg === "." || seg === "..")) return null;
  if (!/^[a-zA-Z0-9/_-]+\.(jsx?|tsx?)$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Resolves `targetSegments` inside `rootDir` and rejects any path escaping `rootDir`
 * (including via `..`, absolute segments, or symlinks when paths exist on disk).
 */
export function resolvePathWithinRoot(rootDir, ...targetSegments) {
  if (!rootDir || typeof rootDir !== "string") return null;

  const resolvedRoot = path.resolve(rootDir);
  const candidate = path.resolve(resolvedRoot, ...targetSegments);

  // First check lexical containment
  if (candidate !== resolvedRoot && !candidate.startsWith(resolvedRoot + path.sep)) {
    return null;
  }

  // If root and target exist, also verify realpath containment to block symlink escapes
  try {
    const realRoot = fs.existsSync(resolvedRoot) ? fs.realpathSync(resolvedRoot) : resolvedRoot;
    const realCandidate = fs.existsSync(candidate) ? fs.realpathSync(candidate) : candidate;
    if (realCandidate !== realRoot && !realCandidate.startsWith(realRoot + path.sep)) {
      return null;
    }
    return realCandidate;
  } catch {
    return null;
  }
}
