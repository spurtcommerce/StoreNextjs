import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Formats a slug / directory name into Title Case for human-friendly display.
 * e.g. "aurora-threads" -> "Aurora Threads"
 */
function formatTitleCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Dynamically resolves or generates a unique, stable numeric theme ID.
 * Extracts from template.json themeId if present; otherwise derives deterministically.
 * No hardcoded mappings!
 */
function resolveThemeId(meta, id, existingIds) {
  const parsed = Number(meta?.themeId);
  if (!isNaN(parsed) && parsed > 0) {
    existingIds.add(parsed);
    return parsed;
  }
  if (id === "default") {
    existingIds.add(11);
    return 11;
  }

  // Derive stable numeric ID from string hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  let candidate = (hash % 899) + 100;
  while (existingIds.has(candidate)) {
    candidate++;
  }
  existingIds.add(candidate);
  return candidate;
}

/**
 * Copies a source file to destination if destination is missing or source is newer/different.
 */
function copyFileIfChanged(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      return true;
    }
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);
    if (srcStat.size !== destStat.size || srcStat.mtimeMs > destStat.mtimeMs) {
      fs.copyFileSync(src, dest);
      return true;
    }
  } catch (err) {
    console.warn(`[TemplateSync] Could not copy ${src} -> ${dest}:`, err.message);
  }
  return false;
}

/**
 * Finds a matching template asset filename dynamically from template.json metadata
 * or by scanning the template directory and its assets/ folder.
 */
function findTemplateAsset(folderPath, subFiles, metaProp, patterns) {
  // 1. Check if template.json explicitly specifies an asset name or path
  if (metaProp && typeof metaProp === "string" && metaProp.trim()) {
    const cleanProp = metaProp.trim().replace(/^\/+/, "");
    const baseName = path.basename(cleanProp);
    if (subFiles.includes(baseName)) {
      return baseName;
    }
    const relativePath = path.join(folderPath, cleanProp);
    if (fs.existsSync(relativePath) && fs.statSync(relativePath).isFile()) {
      return cleanProp;
    }
  }

  // 2. Scan files directly inside the template directory matching regex patterns
  for (const regex of patterns) {
    const match = subFiles.find((f) => regex.test(f));
    if (match) return match;
  }

  // 3. Scan assets/ subdirectory if present
  const assetsDir = path.join(folderPath, "assets");
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    try {
      const assetFiles = fs.readdirSync(assetsDir);
      for (const regex of patterns) {
        const match = assetFiles.find((f) => regex.test(f));
        if (match) return path.join("assets", match);
      }
    } catch {}
  }

  return null;
}

const THUMBNAIL_PATTERNS = [
  /^thumbnail\.(png|jpg|jpeg|webp|svg)$/i,
  /^thumb\.(png|jpg|jpeg|webp|svg)$/i,
  /^cover\.(png|jpg|jpeg|webp|svg)$/i,
  /^card\.(png|jpg|jpeg|webp|svg)$/i,
  /^icon\.(png|jpg|jpeg|webp|svg)$/i,
];

const PREVIEW_PATTERNS = [
  /^preview\.(png|jpg|jpeg|webp|svg)$/i,
  /^screenshot\.(png|jpg|jpeg|webp|svg)$/i,
  /^banner\.(png|jpg|jpeg|webp|svg)$/i,
  /^hero\.(png|jpg|jpeg|webp|svg)$/i,
];

const STYLE_PATTERNS = [
  /^style\.css$/i,
  /^theme\.css$/i,
  /^main\.css$/i,
];

/**
 * Resolves the root directory of the workspace / application.
 */
function resolveAppRoot() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "templates"))) {
    return cwd;
  }
  // Try navigating upwards from __dirname
  let dir = __dirname;
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(dir, "templates"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return cwd;
}

/**
 * Finds the active templates directory.
 */
export function getTemplatesDir() {
  const root = resolveAppRoot();
  const candidates = [
    path.join(root, "templates"),
    path.join(root, "dist", "templates"),
    path.join(root, "dist-template"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      return c;
    }
  }
  return candidates[0];
}

/**
 * Finds the constants.js file to update.
 */
export function getConstantsPath() {
  const root = resolveAppRoot();
  const candidates = [
    path.join(root, "src", "app", "manage", "_lib", "constants.js"),
    path.resolve(__dirname, "..", "app", "manage", "_lib", "constants.js"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return candidates[0];
}

/**
 * Scans the templates directory on disk and extracts metadata for all valid templates.
 * Dynamically resolves details from template.json (without hardcoding), links preview & thumbnail
 * images dynamically from templates/<id>/, and removes absent template assets.
 */
export function scanTemplatesFromDisk() {
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const entries = fs.readdirSync(templatesDir);
  const discovered = [];
  const existingIds = new Set();

  for (const entry of entries) {
    if (entry.startsWith(".") || entry.startsWith("_") || entry === "node_modules" || entry === "registry.json") {
      continue;
    }

    const folderPath = path.join(templatesDir, entry);
    let isDir = false;
    try {
      isDir = fs.statSync(folderPath).isDirectory();
    } catch {
      continue;
    }
    if (!isDir) continue;

    const subFiles = fs.readdirSync(folderPath);

    // Verify folder looks like a template
    const hasJson = subFiles.some((f) => /^template\.json$/i.test(f));
    const hasLayout =
      subFiles.some((f) => /^layout\.(jsx?|tsx?)$/i.test(f)) ||
      fs.existsSync(path.join(folderPath, "Layout.jsx")) ||
      fs.existsSync(path.join(folderPath, "Layout.js")) ||
      fs.existsSync(path.join(folderPath, "dist", "server"));
    const hasRootPage = subFiles.some((f) => /^rootpage\.(jsx?|tsx?)$/i.test(f));

    if (!hasJson && !hasLayout && !hasRootPage) {
      continue;
    }

    let meta = {};
    const jsonFile = subFiles.find((f) => /^template\.json$/i.test(f));
    if (jsonFile) {
      try {
        meta = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), "utf-8"));
      } catch (err) {
        console.warn(`[TemplateSync] Failed to parse template.json in ${entry}:`, err.message);
      }
    }

    const id = (meta.id || entry).toLowerCase().trim();
    const name = meta.name || formatTitleCase(entry);
    const themeId = resolveThemeId(meta, id, existingIds);
    const desc = meta.desc || meta.description || `${name} storefront theme`;
    const version = meta.version || "1.0";

    // 1. Dynamic asset discovery from templates folder (not hardcoded)
    const metaThumb = meta.thumbnail || meta.thumb || meta.image || meta.images?.thumb || meta.images?.thumbnail;
    const metaPreview = meta.preview || meta.previewImage || meta.banner || meta.images?.preview || meta.images?.banner;
    const metaStyle = meta.style || meta.css;

    let thumbRel = findTemplateAsset(folderPath, subFiles, metaThumb, THUMBNAIL_PATTERNS);
    let previewRel = findTemplateAsset(folderPath, subFiles, metaPreview, PREVIEW_PATTERNS);
    const styleRel = findTemplateAsset(folderPath, subFiles, metaStyle, STYLE_PATTERNS);

    // Cross-fallback if only one image type was supplied
    if (!thumbRel && previewRel) thumbRel = previewRel;
    if (!previewRel && thumbRel) previewRel = thumbRel;

    // Check presence in the template folder itself
    const hasThumb = Boolean(thumbRel && fs.existsSync(path.join(folderPath, thumbRel)));
    const hasPreview = Boolean(previewRel && fs.existsSync(path.join(folderPath, previewRel)));
    const hasStyle = Boolean(styleRel && fs.existsSync(path.join(folderPath, styleRel)));

    // Generate dynamic /api/templates/${id}/${asset} routes
    const thumbUrl = hasThumb
      ? `/api/templates/${id}/${path.basename(thumbRel)}`
      : "/img/no-image.png";
    const previewUrl = hasPreview
      ? `/api/templates/${id}/${path.basename(previewRel)}`
      : "/img/no-image.png";
    const styleUrl = `/api/templates/${id}/${styleRel ? path.basename(styleRel) : "style.css"}`;

    discovered.push({
      id,
      themeId,
      name,
      desc,
      version,
      thumb: thumbUrl,
      preview: previewUrl,
      style: styleUrl,
      hasThumb,
      hasPreview,
      hasStyle,
    });
  }

  // Sort: 'default' first if present, then alphabetical by name
  discovered.sort((a, b) => {
    if (a.id === "default") return -1;
    if (b.id === "default") return 1;
    return a.name.localeCompare(b.name);
  });

  return discovered;
}

/**
 * Formats template array into JavaScript code for CANONICAL_TEMPLATES.
 */
function formatCanonicalTemplatesCode(templates) {
  const items = templates
    .map((t) => {
      return (
        `  {\n` +
        `    id: ${JSON.stringify(t.id)},\n` +
        `    themeId: ${t.themeId},\n` +
        `    name: ${JSON.stringify(t.name)},\n` +
        `    desc: ${JSON.stringify(t.desc)},\n` +
        `    version: ${JSON.stringify(t.version)},\n` +
        `    thumb: ${JSON.stringify(t.thumb)},\n` +
        `    preview: ${JSON.stringify(t.preview)},\n` +
        `    style: ${JSON.stringify(t.style)},\n` +
        `    hasThumb: ${Boolean(t.hasThumb)},\n` +
        `    hasPreview: ${Boolean(t.hasPreview)},\n` +
        `    hasStyle: ${Boolean(t.hasStyle)},\n` +
        `  }`
      );
    })
    .join(",\n");

  return `export const CANONICAL_TEMPLATES = [\n${items}\n];`;
}

/**
 * Synchronizes templates on disk with CANONICAL_TEMPLATES in constants.js
 * and updates registry.json files.
 */
export function syncCanonicalTemplates(options = {}) {
  try {
    const templates = scanTemplatesFromDisk();

    // Keep global in-memory cache current
    if (typeof globalThis !== "undefined") {
      globalThis.__CANONICAL_TEMPLATES = templates;
    }

    const constantsPath = getConstantsPath();
    let fileChanged = false;

    if (fs.existsSync(constantsPath)) {
      const currentContent = fs.readFileSync(constantsPath, "utf-8");
      const regex = /export const CANONICAL_TEMPLATES = \[\s*[\s\S]*?\s*\];/;
      const newBlock = formatCanonicalTemplatesCode(templates);

      if (regex.test(currentContent)) {
        const updatedContent = currentContent.replace(regex, newBlock);
        if (updatedContent !== currentContent) {
          fs.writeFileSync(constantsPath, updatedContent, "utf-8");
          fileChanged = true;
          console.log(`[TemplateSync] ✓ Synchronized ${templates.length} templates into constants.js`);
        } else if (options.verbose) {
          console.log(`[TemplateSync] constants.js is already up to date (${templates.length} templates).`);
        }
      } else {
        console.warn("[TemplateSync] Could not find CANONICAL_TEMPLATES definition in constants.js to replace.");
      }
    }

    // Write templates/registry.json
    // STRICT RULE: Contains ONLY templates physically present on disk.
    // Any absent template is completely removed.
    const root = resolveAppRoot();
    const registryLocations = [
      path.join(root, "templates", "registry.json"),
    ];

    const registryData = JSON.stringify(templates, null, 2);
    for (const regPath of registryLocations) {
      try {
        const regDir = path.dirname(regPath);
        if (fs.existsSync(regDir)) {
          fs.writeFileSync(regPath, registryData, "utf-8");
        }
      } catch (regErr) {
        console.warn(`[TemplateSync] Could not write ${regPath}:`, regErr.message);
      }
    }

    return {
      changed: fileChanged,
      count: templates.length,
      templates,
    };
  } catch (error) {
    console.error("[TemplateSync] Error during template sync:", error);
    return { changed: false, count: 0, error: error.message };
  }
}

/**
 * Gets the current active canonical templates (cached in-memory or dynamically resolved).
 */
export function getActiveCanonicalTemplates() {
  if (typeof globalThis !== "undefined" && Array.isArray(globalThis.__CANONICAL_TEMPLATES)) {
    return globalThis.__CANONICAL_TEMPLATES;
  }
  const result = syncCanonicalTemplates();
  return result.templates || [];
}

/**
 * Initializes a file watcher on the templates folder to automatically re-sync
 * whenever a template folder is added, deleted, or changed.
 * Runs in both development and production.
 */
export function initTemplateWatcher() {
  if (typeof globalThis !== "undefined" && globalThis.__templateWatcherInitialized) {
    return;
  }

  const templatesDir = getTemplatesDir();
  if (!fs.existsSync(templatesDir)) {
    return;
  }

  if (typeof globalThis !== "undefined") {
    globalThis.__templateWatcherInitialized = true;
  }

  let debounceTimer = null;
  const triggerSync = (eventType, filename) => {
    if (filename && (filename.startsWith(".") || filename === "registry.json")) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`[TemplateSync] Template change detected (${eventType}: ${filename || "directory"}). Auto-updating registry and public assets...`);
      syncCanonicalTemplates({ verbose: true });
    }, 300);
  };

  try {
    const watcher = fs.watch(templatesDir, { recursive: true }, triggerSync);
    watcher.on("error", (err) => {
      console.warn("[TemplateSync] Templates directory watcher warning:", err.message);
    });

    console.log(`[TemplateSync] ✓ Active template watcher initialized on ${templatesDir}`);
  } catch (err) {
    console.warn("[TemplateSync] Could not initialize directory watcher:", err.message);
  }
}

