import fs from "fs";
import path from "path";
import { CANONICAL_TEMPLATES } from "../app/manage/_lib/constants.js";
import {
  getActiveCanonicalTemplates,
  scanTemplatesFromDisk,
  syncCanonicalTemplates,
} from "./templateSync.js";

export { CANONICAL_TEMPLATES };

/**
 * Resolves static template assets directly from templates/${id} or dist/templates/${id}.
 * If the image exists on disk in templates, returns its dynamic API URL path (/api/templates/${id}/${asset}).
 * Otherwise returns null (triggering fallback to /img/no-image.png).
 */
export function findPublicTemplateAsset(templateId, assetType) {
  if (!templateId) return null;
  const cwd = process.cwd();
  const searchDirs = [
    path.join(cwd, "templates", templateId),
    path.join(cwd, "dist", "templates", templateId),
  ];
  const exts = [".png", ".jpg", ".jpeg", ".webp", ".svg"];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      for (const ext of exts) {
        const filePath = path.join(dir, `${assetType}${ext}`);
        if (fs.existsSync(filePath)) {
          return `/api/templates/${templateId}/${assetType}${ext}`;
        }
      }
    }
  }
  return null;
}


/**
 * Checks if a given directory path actually contains valid template subdirectories
 * (i.e. child directories that contain layout.*, rootpage.*, or template.json).
 */
export function hasValidTemplateFolders(dir) {
  try {
    if (!dir || !fs.existsSync(dir)) return false;
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) return false;

    const entries = fs.readdirSync(dir);
    return entries.some((entry) => {
      if (entry.startsWith(".")) return false;
      const subPath = path.join(dir, entry);
      try {
        const subStat = fs.statSync(subPath);
        if (subStat.isDirectory()) {
          const subFiles = fs.readdirSync(subPath);
          return (
            subFiles.some((f) =>
              /^(layout\.(jsx?|tsx?)|template\.json|rootpage\.(jsx?|tsx?))$/i.test(f)
            ) ||
            fs.existsSync(path.join(subPath, "dist", "server")) ||
            fs.existsSync(path.join(subPath, "dist", "server", "Layout.js")) ||
            fs.existsSync(path.join(subPath, "Layout.js"))
          );
        }
      } catch {
        return false;
      }
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Discovers potential candidate locations for the templates folder across
 * various deployment environments (local dev, standalone, PM2, Docker, monorepos).
 * Supports both plural 'templates' and singular 'template' folder naming.
 */
export function getCandidateDirectories() {
  const cwd = process.cwd();
  const list = [];

  if (process.env.TEMPLATES_DIR) {
    list.push(process.env.TEMPLATES_DIR);
  }

  const isDistMode =
    path.basename(cwd) === "dist" ||
    fs.existsSync(path.resolve(cwd, "server.js")) ||
    process.env.STANDALONE === "true";

  const folderNames = isDistMode
    ? ["templates", "template"]
    : ["templates", "template", ["dist", "template"].join("-")];
  const basePaths = [
    cwd,
    path.resolve(cwd, "dist"),
    path.resolve(cwd, "src"),
    path.resolve(cwd, ".."),
    path.resolve(cwd, "..", ".."),
  ];

  for (const base of basePaths) {
    for (const folder of folderNames) {
      list.push(path.resolve(base, folder));
    }
  }

  if (typeof __dirname !== "undefined") {
    const rels = [
      "../../../../..",
      "../../../..",
      "../../..",
      "../..",
      "..",
      ".",
    ];
    for (const rel of rels) {
      for (const folder of folderNames) {
        list.push(path.resolve(__dirname, rel, folder));
      }
    }
  }

  // Deduplicate
  return Array.from(new Set(list));
}

/**
 * Finds the actual templates directory dynamically on disk.
 * Prioritizes directories that actually contain valid template subfolders.
 */
export function findTemplatesDir() {
  const candidates = getCandidateDirectories();

  // Primary check: candidate directory must actually contain template subfolders
  for (const dir of candidates) {
    if (hasValidTemplateFolders(dir)) {
      return dir;
    }
  }

  // Fallback check: any directory that exists as a folder on disk
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) {
        const stat = fs.statSync(dir);
        if (stat.isDirectory()) {
          return dir;
        }
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

/**
 * Dynamically scans the templates folder and returns templates
 * whose design files (Layout, RootPage, or template.json) exist on disk.
 * Falls back to the canonical template catalog if no template folders are found on disk,
 * ensuring the production storefront and admin never break.
 */
export async function getDynamicTemplates(includeDiagnostics = false) {
  const templatesDir = findTemplatesDir();
  const diagnostics = {
    templatesDir,
    hasValidSubfolders: hasValidTemplateFolders(templatesDir),
    rawEntries: [],
    processedFolders: [],
    error: null,
    fallbackUsed: false,
    source: "disk",
  };

  let templates = [];
  try {
    // Synchronize disk templates and update registry.json
    const syncResult = syncCanonicalTemplates();
    templates = syncResult.templates || [];
  } catch (err) {
    console.error("Error reading templates directory dynamically:", err);
    diagnostics.error = err.message;
  }

  // If no templates were discovered from disk (e.g. production server missing subfolders),
  // fall back to canonical built-in templates so the storefront and admin never break!
  if (!templates || templates.length === 0) {
    diagnostics.fallbackUsed = true;
    diagnostics.source = "canonical_fallback";
    diagnostics.reason = templatesDir
      ? `Templates directory ${templatesDir} contained no template subfolders`
      : "No templates directory resolved on disk";
    const canonicalCatalog = getActiveCanonicalTemplates() || CANONICAL_TEMPLATES;
    templates = (canonicalCatalog.length > 0 ? canonicalCatalog : CANONICAL_TEMPLATES).map((t) => {
      const publicThumb = findPublicTemplateAsset(t.id, "thumbnail") || findPublicTemplateAsset(t.id, "thumb");
      const publicPreview = findPublicTemplateAsset(t.id, "preview");
      return {
        ...t,
        thumb: publicThumb || (t.hasThumb ? t.thumb : "/img/no-image.png"),
        preview: publicPreview || (t.hasPreview ? t.preview : "/img/no-image.png"),
        hasThumb: Boolean(publicThumb || t.hasThumb),
        hasPreview: Boolean(publicPreview || t.hasPreview),
      };
    });
  }

  // Sort: 'default' first if present, then alphabetical by name
  templates.sort((a, b) => {
    if (a.id === "default") return -1;
    if (b.id === "default") return 1;
    return a.name.localeCompare(b.name);
  });

  return includeDiagnostics ? { templates, diagnostics } : templates;
}

