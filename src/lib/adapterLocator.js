import fs from "fs";
import path from "path";

/**
 * Directories or names inside src/adapters that are internal and NOT standalone adapters.
 */
const EXCLUDED_FOLDERS = new Set(["models", "schemas", "registry", "__tests__", "common", "node_modules"]);
const SAFE_ADAPTER_SLUG = /^[a-z0-9-]+$/;

/**
 * Returns true when executing inside the standalone dist runtime.
 */
export function isDistModeRuntime() {
  const cwd = process.cwd();
  return (
    path.basename(cwd) === "dist" ||
    fs.existsSync(path.resolve(cwd, "server.js")) ||
    process.env.STANDALONE === "true"
  );
}

/**
 * Discovers candidate locations for the adapters folder across
 * standalone dist and local development environments.
 * - Dist mode: strictly ./adapters (dist/adapters/)
 * - Dev mode: root ./adapters (if created) or ./src/adapters/
 */
export function getCandidateAdapterDirectories() {
  const cwd = process.cwd();
  const list = [];

  if (process.env.COMMERCE_ADAPTERS_DIR) {
    list.push(process.env.COMMERCE_ADAPTERS_DIR);
  }
  if (process.env.ADAPTERS_DIR) {
    list.push(process.env.ADAPTERS_DIR);
  }

  if (isDistModeRuntime()) {
    list.push(path.resolve(cwd, "adapters"));
  } else {
    list.push(path.resolve(cwd, "adapters"));
    list.push(path.resolve(cwd, "src", "adapters"));
  }

  return Array.from(new Set(list));
}

function isValidAdapterSubfolder(subPath) {
  try {
    if (!fs.existsSync(subPath) || !fs.statSync(subPath).isDirectory()) {
      return false;
    }
    const files = fs.readdirSync(subPath);
    return (
      files.some((f) => /^adapter\.json$/i.test(f)) ||
      files.some((f) => /adapter\.(jsx?|tsx?)$/i.test(f)) ||
      files.some((f) => /^index\.(jsx?|cjs|mjs|tsx?)$/i.test(f))
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a specific adapter ID exists and is available on disk in the active adapters directory.
 * Never falls back to hardcoded adapters when missing from disk.
 */
export function isAdapterAvailable(adapterId) {
  if (!adapterId) return false;
  const targetId = String(adapterId).toLowerCase().trim();
  if (!SAFE_ADAPTER_SLUG.test(targetId) || EXCLUDED_FOLDERS.has(targetId)) {
    return false;
  }

  const adaptersDir = findAdaptersDir();
  const candidates = adaptersDir ? [adaptersDir] : getCandidateAdapterDirectories();

  for (const dir of candidates) {
    if (!dir || !fs.existsSync(dir)) continue;
    const subPath = path.join(dir, targetId);
    if (isValidAdapterSubfolder(subPath)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a given directory path contains valid adapter subfolders.
 */
export function hasValidAdapterFolders(dir) {
  try {
    if (!dir || !fs.existsSync(dir)) return false;
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) return false;

    const entries = fs.readdirSync(dir);
    return entries.some((entry) => {
      if (entry.startsWith(".") || EXCLUDED_FOLDERS.has(entry.toLowerCase())) return false;
      return isValidAdapterSubfolder(path.join(dir, entry));
    });
  } catch {
    return false;
  }
}

/**
 * Resolves the primary adapters directory on disk.
 */
export function findAdaptersDir() {
  const candidates = getCandidateAdapterDirectories();

  for (const dir of candidates) {
    if (hasValidAdapterFolders(dir)) {
      return dir;
    }
  }

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        return dir;
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

/**
 * Resolves the folder path for a specific adapter on disk if present.
 */
export function resolveAdapterFolder(adapterId) {
  if (!adapterId) return null;
  const targetId = String(adapterId).toLowerCase().trim();
  if (!SAFE_ADAPTER_SLUG.test(targetId) || EXCLUDED_FOLDERS.has(targetId)) {
    return null;
  }
  const adaptersDir = findAdaptersDir();
  const candidates = adaptersDir ? [adaptersDir] : getCandidateAdapterDirectories();

  for (const baseDir of candidates) {
    if (!baseDir || !fs.existsSync(baseDir)) continue;
    const adapterFolder = path.join(baseDir, targetId);
    if (isValidAdapterSubfolder(adapterFolder)) {
      return adapterFolder;
    }
  }
  return null;
}

/**
 * Resolves static adapter assets (logo, icon) strictly from inside the adapter's own folder
 * (e.g. dist/adapters/${id}/logo.png or src/adapters/${id}/logo.png).
 */
export function findAdapterAsset(adapterId, assetType = "logo") {
  const adapterFolder = resolveAdapterFolder(adapterId);
  if (!adapterFolder) return null;

  const exts = [".png", ".svg", ".webp", ".jpg", ".jpeg"];
  const targetId = String(adapterId).toLowerCase().trim();
  const candidates = Array.from(
    new Set([assetType, "logo", "icon", "platform", targetId].filter(Boolean))
  );

  for (const name of candidates) {
    for (const ext of exts) {
      const filePath = path.join(adapterFolder, `${name}${ext}`);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return filePath;
      }
    }
  }

  return null;
}

/**
 * Reads the adapter manifest (adapter.json) and input form model (form-model.json)
 * from an adapter folder on disk.
 */
function readAdapterMetadataSync(dirPath, folderFiles = []) {
  let meta = {};
  const jsonFileName = folderFiles.find((f) => /^adapter\.json$/i.test(f));
  if (jsonFileName) {
    try {
      const raw = fs.readFileSync(path.join(dirPath, jsonFileName), "utf-8");
      meta = JSON.parse(raw);
    } catch (err) {
      console.warn(`Failed to parse ${jsonFileName} in ${dirPath}:`, err);
    }
  }

  let formModel = meta.formModel || meta.inputForm || null;
  const formModelFileName = folderFiles.find((f) =>
    /^(form-model|form\.model|config-model|input-form)\.json$/i.test(f)
  );
  if (formModelFileName) {
    try {
      const rawForm = fs.readFileSync(path.join(dirPath, formModelFileName), "utf-8");
      formModel = JSON.parse(rawForm);
    } catch (err) {
      console.warn(`Failed to parse ${formModelFileName} in ${dirPath}:`, err);
    }
  }

  return { meta, formModel };
}

/**
 * Reads capabilities for an installed adapter directly from its folder's adapter.json.
 */
export function getAdapterCapabilities(adapterId) {
  const adapterFolder = resolveAdapterFolder(adapterId);
  if (!adapterFolder) return null;
  try {
    const files = fs.readdirSync(adapterFolder);
    const { meta } = readAdapterMetadataSync(adapterFolder, files);
    return meta?.capabilities || null;
  } catch {
    return null;
  }
}

/**
 * Reads a single adapter's form-model.json directly from its folder on disk.
 */
export function getAdapterFormModel(adapterId) {
  const adapterFolder = resolveAdapterFolder(adapterId);
  if (!adapterFolder) return null;
  try {
    const files = fs.readdirSync(adapterFolder);
    const { formModel } = readAdapterMetadataSync(adapterFolder, files);
    return formModel || null;
  } catch {
    return null;
  }
}

/**
 * Dynamically scans the active adapters directory and returns all valid commerce adapters
 * physically present on disk, along with their logo, description, and input form model.
 * Never falls back to hardcoded adapters when none are present on disk.
 */
export async function getDynamicAdapters(includeDiagnostics = false) {
  const adaptersDir = findAdaptersDir();
  const diagnostics = {
    adaptersDir,
    hasValidSubfolders: hasValidAdapterFolders(adaptersDir),
    rawEntries: [],
    processedFolders: [],
    error: null,
    fallbackUsed: false,
    source: "disk",
  };

  const adapters = [];

  if (adaptersDir && fs.existsSync(adaptersDir)) {
    try {
      let rawList = [];
      try {
        rawList = await fs.promises.readdir(adaptersDir);
        diagnostics.rawEntries = rawList;
      } catch (e) {
        diagnostics.error = `Failed to readdir ${adaptersDir}: ${e.message}`;
      }

      for (const name of rawList) {
        if (name.startsWith(".")) continue;
        if (EXCLUDED_FOLDERS.has(name.toLowerCase())) continue;

        const dirPath = path.join(adaptersDir, name);
        let isDir = false;
        try {
          isDir = fs.statSync(dirPath).isDirectory();
        } catch (statErr) {
          diagnostics.processedFolders.push({ name, isDir: false, error: statErr.message });
          continue;
        }
        if (!isDir) continue;

        let folderFiles = [];
        try {
          folderFiles = await fs.promises.readdir(dirPath);
        } catch (readDirErr) {
          diagnostics.processedFolders.push({ name, isDir: true, error: readDirErr.message });
          continue;
        }

        const hasAdapterJson = folderFiles.some((f) => /^adapter\.json$/i.test(f));
        const hasAdapterCode = folderFiles.some(
          (f) => /adapter\.(jsx?|tsx?)$/i.test(f) || /^index\.(jsx?|cjs|mjs|tsx?)$/i.test(f)
        );

        diagnostics.processedFolders.push({
          name,
          filesCount: folderFiles.length,
          hasAdapterJson,
          hasAdapterCode,
        });

        if (!hasAdapterJson && !hasAdapterCode) {
          continue;
        }

        const { meta, formModel } = readAdapterMetadataSync(dirPath, folderFiles);
        const id = (meta.name || meta.id || name).toLowerCase().trim();

        const displayName =
          meta.displayName ||
          meta.name ||
          name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

        const description =
          meta.description ||
          `Connect your ${displayName} backend endpoint and configure API settings`;

        const version = meta.version || "1.0.0";
        const docsUrl = meta.docsUrl || "";
        const capabilities = meta.capabilities || {};

        const assetFile = findAdapterAsset(id, "logo");
        const hasLogo = Boolean(assetFile);
        const logo = hasLogo
          ? `/api/connectors/${id}/logo`
          : meta.logo && !String(meta.logo).startsWith("/platforms/")
            ? meta.logo
            : "";

        adapters.push({
          id,
          name: displayName,
          displayName,
          description,
          version,
          docsUrl,
          capabilities,
          hasLogo,
          logo,
          formModel: formModel || { fields: [] },
        });
      }
    } catch (err) {
      console.error("Error reading adapters directory dynamically:", err);
      diagnostics.error = err.message;
    }
  }

  if (adapters.length === 0) {
    diagnostics.reason = adaptersDir
      ? `Adapters directory ${adaptersDir} contained no valid adapter subfolders`
      : "No adapters directory resolved on disk";
  }

  // Sort adapters: Medusa and Spurt first (if present), then alphabetically
  adapters.sort((a, b) => {
    const priority = { medusa: 1, spurt: 2, opencart: 3 };
    const pA = priority[a.id] || 99;
    const pB = priority[b.id] || 99;
    if (pA !== pB) return pA - pB;
    return a.name.localeCompare(b.name);
  });

  return includeDiagnostics ? { adapters, diagnostics } : adapters;
}

/**
 * Resolves the bridge folder inside an adapter directory (e.g. src/adapters/opencart/opencart-bridge).
 */
export function getAdapterBridgeDir(adapterId) {
  const adapterFolder = resolveAdapterFolder(adapterId);
  if (!adapterFolder) return null;
  const targetId = String(adapterId).toLowerCase().trim();
  const candidates = [`${targetId}-bridge`, "bridge"];
  for (const name of candidates) {
    const dirPath = path.join(adapterFolder, name);
    try {
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        return dirPath;
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}

/**
 * Recursively lists all relative file paths inside an adapter's bridge folder.
 */
export function listAdapterBridgeFiles(adapterId) {
  const bridgeDir = getAdapterBridgeDir(adapterId);
  if (!bridgeDir) return [];

  const results = [];
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push(path.relative(bridgeDir, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  try {
    walk(bridgeDir);
  } catch {
    return [];
  }
  return results.sort();
}

/**
 * Safely reads a file from inside an adapter's bridge folder, preventing path traversal.
 */
export function readAdapterBridgeFile(adapterId, relativePath) {
  const bridgeDir = getAdapterBridgeDir(adapterId);
  if (!bridgeDir || typeof relativePath !== "string" || !relativePath.trim()) {
    return null;
  }

  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolvedRoot = path.resolve(bridgeDir);
  const resolvedFile = path.resolve(resolvedRoot, normalized);

  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(resolvedRoot + path.sep)) {
    return null;
  }

  try {
    if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
      return null;
    }
    return {
      filePath: resolvedFile,
      relativePath: path.relative(resolvedRoot, resolvedFile).replace(/\\/g, "/"),
      content: fs.readFileSync(resolvedFile),
    };
  } catch {
    return null;
  }
}
