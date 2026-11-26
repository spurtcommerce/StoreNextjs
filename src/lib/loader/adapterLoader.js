import fs from "fs";
import path from "path";
import vm from "vm";
import { createRequire } from "module";
import { findAdapterDir } from "./adapterLocator.js";
import { resolvePathWithinRoot, validateAdapterName } from "./pathSecurity.js";

const adapterCache = new Map();

function getNativeRequire(fromPath) {
  // 1. If running under Webpack / Next.js server, __non_webpack_require__ is Node's native require
  if (typeof __non_webpack_require__ === "function") {
    try {
      const nodeModule = __non_webpack_require__("module");
      if (nodeModule && typeof nodeModule.createRequire === "function") {
        return nodeModule.createRequire(fromPath || path.resolve(process.cwd(), "package.json"));
      }
    } catch {}
    return __non_webpack_require__;
  }

  // 2. Standard Node module createRequire (works in Turbopack & ESM without bundler interception)
  try {
    if (typeof createRequire === "function") {
      return createRequire(fromPath || path.resolve(process.cwd(), "package.json"));
    }
  } catch {}

  // 3. Node module createRequire via eval require
  try {
    const nodeReq = (0, eval)("require");
    if (typeof nodeReq === "function") {
      try {
        const nodeModule = nodeReq("module");
        if (nodeModule && typeof nodeModule.createRequire === "function") {
          return nodeModule.createRequire(fromPath || path.resolve(process.cwd(), "package.json"));
        }
      } catch {}
      return nodeReq;
    }
  } catch {}

  // 4. Fallback to standard require
  try {
    if (typeof require === "function") {
      return require;
    }
  } catch {}

  return null;
}

/**
 * Executes a precompiled CommonJS module from disk within the Node.js runtime.
 * Uses vm.compileFunction to bypass Turbopack / Webpack AST interception of dynamic require.
 */
function requireExternalModule(filePath) {
  if (adapterCache.has(filePath)) {
    return adapterCache.get(filePath);
  }

  try {
    const code = fs.readFileSync(filePath, "utf-8");
    // Uncompiled ESM source files in dev src/adapters/ cannot be executed directly via vm.compileFunction (CJS)
    if (/^\s*(import|export)\s/m.test(code)) {
      return null;
    }
    const nativeRequire = getNativeRequire(filePath);
    const customRequire = function (id) {
      if (nativeRequire && typeof nativeRequire === "function") {
        try {
          return nativeRequire(id);
        } catch (e) {
          try {
            return (0, eval)("require")(id);
          } catch {}
          throw e;
        }
      }
      return (0, eval)("require")(id);
    };

    customRequire.resolve = function (id, options) {
      if (nativeRequire && typeof nativeRequire.resolve === "function") {
        return nativeRequire.resolve(id, options);
      }
      return id;
    };

    const cjsModule = { exports: {} };
    const wrapper = vm.compileFunction(
      code,
      ["exports", "require", "module", "__filename", "__dirname"],
      { filename: filePath }
    );
    wrapper(
      cjsModule.exports,
      customRequire,
      cjsModule,
      filePath,
      path.dirname(filePath)
    );
    const mod = cjsModule.exports?.default || cjsModule.exports;
    adapterCache.set(filePath, mod);
    return mod;
  } catch (err) {
    console.error(`[adapterLoader] Failed to load external module ${filePath}:`, err);
    return null;
  }
}

/**
 * Dynamically loads a precompiled adapter package from disk (or cache).
 * Runtime compilation is disabled; adapters must be prebuilt at build time.
 *
 * @param {string} adapterName - e.g. "medusa", "spurt"
 * @returns {object|null} Adapter definition containing domain classes & capabilities
 */
export function loadAdapter(adapterName) {
  const key = validateAdapterName(adapterName);
  if (!key) {
    if (adapterName) {
      console.warn(`[adapterLoader] Rejected invalid or unknown adapter name.`);
    }
    return null;
  }

  if (adapterCache.has(key)) {
    return adapterCache.get(key);
  }

  // 1. Locate adapter directory on disk (already validated & root-contained)
  const adapterDir = findAdapterDir(key);
  if (!adapterDir) {
    console.warn(`[adapterLoader] Could not locate adapter directory for "${key}".`);
    return null;
  }

  // 2. Read adapter.json manifest if present
  let manifest = {};
  const manifestPath = resolvePathWithinRoot(adapterDir, "adapter.json");
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch (e) {
      console.warn(`[adapterLoader] Failed to parse adapter.json for "${key}":`, e.message);
    }
  }

  // 3. Resolve entry file strictly contained within adapterDir
  const entryCandidates = [
    typeof manifest.entry === "string" && manifest.entry ? manifest.entry : null,
    path.join("dist", "index.js"),
    "index.js",
    "index.cjs",
  ].filter(Boolean);

  const entryFiles = entryCandidates
    .map((relEntry) => resolvePathWithinRoot(adapterDir, relEntry))
    .filter(Boolean);

  let loadedMod = null;
  for (const entryPath of entryFiles) {
    if (fs.existsSync(entryPath)) {
      loadedMod = requireExternalModule(entryPath);
      if (loadedMod) break;
    }
  }

  if (loadedMod) {
    // Merge capabilities from manifest if not directly on the export
    if (manifest.capabilities && !loadedMod.capabilities) {
      loadedMod.capabilities = manifest.capabilities;
    }
    adapterCache.set(key, loadedMod);
    console.log(`[adapterLoader] Successfully loaded external adapter "${key}" from ${adapterDir}`);
    return loadedMod;
  }

  console.warn(`[adapterLoader] Failed to initialize adapter module for "${key}".`);
  return null;
}
