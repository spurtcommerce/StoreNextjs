import fs from "fs";
import path from "path";
import vm from "vm";
import { createRequire } from "module";
import { findAdapterDir } from "./adapterLocator.js";

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

  // 2. Node module createRequire via eval require
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

  // 3. Fallback to imported createRequire
  try {
    if (typeof createRequire === "function") {
      return createRequire(fromPath || path.resolve(process.cwd(), "package.json"));
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
 * On-demand compile helper for uncompiled adapter folders dropped at runtime.
 */
function tryAutoCompile(adapterDir, adapterName) {
  try {
    const req = getNativeRequire();
    const { execSync } = req ? req("child_process") : {};
    const scriptPath = path.resolve(process.cwd(), "scripts", "build-adapter.mjs");
    if (execSync && fs.existsSync(scriptPath)) {
      execSync(`node "${scriptPath}" ${adapterName}`, { stdio: "ignore" });
      const outFilePath = path.join(adapterDir, "index.js");
      if (fs.existsSync(outFilePath)) return outFilePath;
    }
    return null;
  } catch (compileErr) {
    console.warn(`[adapterLoader] On-demand compile failed for adapter ${adapterName}:`, compileErr.message);
    return null;
  }
}

/**
 * Dynamically loads an adapter package from disk (or cache).
 *
 * @param {string} adapterName - e.g. "medusa", "spurt"
 * @returns {object|null} Adapter definition containing domain classes & capabilities
 */
export function loadAdapter(adapterName) {
  if (!adapterName) return null;
  const key = adapterName.toLowerCase().trim();

  if (adapterCache.has(key)) {
    return adapterCache.get(key);
  }

  // 1. Locate adapter directory on disk
  const adapterDir = findAdapterDir(key);
  if (!adapterDir) {
    console.warn(`[adapterLoader] Could not locate adapter directory for "${key}".`);
    return null;
  }

  // 2. Read adapter.json manifest if present
  let manifest = {};
  const manifestPath = path.join(adapterDir, "adapter.json");
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch (e) {
      console.warn(`[adapterLoader] Failed to parse adapter.json for "${key}":`, e.message);
    }
  }

  // 3. Resolve entry file
  const entryFiles = [
    manifest.entry ? path.join(adapterDir, manifest.entry) : null,
    path.join(adapterDir, "dist", "index.js"),
    path.join(adapterDir, "index.js"),
    path.join(adapterDir, "index.cjs"),
  ].filter(Boolean);

  let loadedMod = null;
  for (const entryPath of entryFiles) {
    if (fs.existsSync(entryPath)) {
      loadedMod = requireExternalModule(entryPath);
      if (loadedMod) break;
    }
  }

  // 4. Try JIT compile if raw index.js exists but wasn't directly require-able
  if (!loadedMod) {
    const rawIndex = path.join(adapterDir, "index.js");
    if (fs.existsSync(rawIndex)) {
      const compiledPath = tryAutoCompile(adapterDir, key);
      if (compiledPath && fs.existsSync(compiledPath)) {
        loadedMod = requireExternalModule(compiledPath);
      }
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
