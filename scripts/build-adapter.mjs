import fs from "fs";
import path from "path";
import esbuild from "esbuild";

function resolveWithExt(basePath) {
  const exts = ["", ".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.jsx"];
  for (const ext of exts) {
    const full = basePath + ext;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

const KNOWN_ADAPTERS = ["medusa", "spurt"];

function getSourceDir(adapterName) {
  const cwd = process.cwd();
  // 1. Check private adapters source directory first
  const privateSrc = path.resolve(cwd, "src", "adapters-source", adapterName);
  if (fs.existsSync(privateSrc)) return privateSrc;

  // 2. Check root _adapters_src
  const rootSrc = path.resolve(cwd, "_adapters_src", adapterName);
  if (fs.existsSync(rootSrc)) return rootSrc;

  // 3. Fallback to src/adapters/<name>
  const regularSrc = path.resolve(cwd, "src", "adapters", adapterName);
  if (fs.existsSync(regularSrc)) return regularSrc;

  throw new Error(
    `Adapter source directory not found for "${adapterName}". Looked in src/adapters-source and src/adapters.`
  );
}

export async function buildAdapter(adapterName, options = {}) {
  const cwd = process.cwd();
  const sourceDir = getSourceDir(adapterName);

  const isDeploy = Boolean(options.deploy);
  const outDir =
    options.outDir ||
    (isDeploy
      ? path.resolve(cwd, "dist", "adapters", adapterName)
      : path.resolve(cwd, "src", "adapters", adapterName));

  fs.mkdirSync(outDir, { recursive: true });

  const format = isDeploy ? "cjs" : options.format || "esm";
  const target = isDeploy ? "node18" : "es2022";

  console.log(`\n==================================================`);
  console.log(` Building Protected Adapter: [${adapterName}]`);
  console.log(` Source: ${sourceDir}`);
  console.log(` Target: ${outDir}`);
  console.log(` Format: ${format.toUpperCase()} | Minify & Mangle: ACTIVE`);
  console.log(`==================================================\n`);

  const entryFile = path.join(sourceDir, "index.js");
  if (!fs.existsSync(entryFile)) {
    throw new Error(`Adapter entrypoint not found: ${entryFile}`);
  }

  const outFilePath = path.join(outDir, "index.js");

  await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    outfile: outFilePath,
    format,
    platform: isDeploy ? "node" : "neutral",
    target,
    minify: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    legalComments: "none",
    sourcemap: false,
    drop: ["debugger"],
    loader: {
      ".js": "jsx",
      ".json": "json",
    },
    plugins: [
      {
        name: "adapter-resolver",
        setup(build) {
          // Resolve ../models to src/adapters/models during build
          build.onResolve({ filter: /^\.\.\/models\// }, (args) => {
            return {
              path: path.resolve(
                cwd,
                "src",
                "adapters",
                "models",
                args.path.replace(/^\.\.\/models\//, "")
              ),
            };
          });

          // Resolve @/ aliases to src/
          build.onResolve({ filter: /^@\// }, (args) => {
            const raw = path.resolve(cwd, "src", args.path.replace(/^@\//, ""));
            const resolved = resolveWithExt(raw);
            return resolved ? { path: resolved } : { path: raw };
          });

          // Externalize runtime core modules with relative resolution for the target index.js
          build.onResolve(
            {
              filter:
                /(\/api\/interceptor|\/utilities\/tokenHelper|\/config\/adapter\.config|\/models\/registry\/store-adapter\.helper)/,
            },
            (args) => {
              if (format === "esm") {
                if (args.path.includes("interceptor"))
                  return { path: "../../api/interceptor.js", external: true };
                if (args.path.includes("tokenHelper"))
                  return { path: "../../utilities/tokenHelper.js", external: true };
                if (args.path.includes("adapter.config"))
                  return { path: "../../config/adapter.config.js", external: true };
                if (args.path.includes("store-adapter.helper"))
                  return {
                    path: "../models/registry/store-adapter.helper.js",
                    external: true,
                  };
              } else {
                if (args.path.includes("interceptor"))
                  return {
                    path: path.resolve(cwd, "src", "api", "interceptor.js"),
                    external: true,
                  };
                if (args.path.includes("tokenHelper"))
                  return {
                    path: path.resolve(cwd, "src", "utilities", "tokenHelper.js"),
                    external: true,
                  };
                if (args.path.includes("adapter.config"))
                  return {
                    path: path.resolve(cwd, "src", "config", "adapter.config.js"),
                    external: true,
                  };
                if (args.path.includes("store-adapter.helper"))
                  return {
                    path: path.resolve(
                      cwd,
                      "src",
                      "adapters",
                      "models",
                      "registry",
                      "store-adapter.helper.js"
                    ),
                    external: true,
                  };
              }
              return { path: args.path, external: true };
            }
          );

          // Keep shared node/browser runtime packages external
          build.onResolve(
            {
              filter:
                /^(axios|react|react-dom|next|crypto|fs|path|url|http|https|stream|util|events)(\/.*)?$/,
            },
            (args) => ({ path: args.path, external: true })
          );
        },
      },
    ],
    logLevel: "warning",
  });

  const bundleStats = fs.statSync(outFilePath);
  console.log(
    `  ✓ Compiled & Obfuscated: index.js (${(bundleStats.size / 1024).toFixed(1)} KB)`
  );

  // Copy adapter.json
  const manifestSrc = path.join(sourceDir, "adapter.json");
  const manifestDest = path.join(outDir, "adapter.json");
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest);
    console.log(`  ✓ Copied: adapter.json`);
  } else {
    const fallbackManifest = {
      name: adapterName,
      version: "1.0.0",
      entry: "index.js",
    };
    fs.writeFileSync(manifestDest, JSON.stringify(fallbackManifest, null, 2), "utf-8");
    console.log(`  ✓ Generated: adapter.json (fallback)`);
  }

  // If in-place build (updating src/adapters/<adapterName>), clean up all exposed source files
  if (
    !isDeploy &&
    path.resolve(outDir) === path.resolve(cwd, "src", "adapters", adapterName)
  ) {
    const files = fs.readdirSync(outDir);
    let removedCount = 0;
    for (const f of files) {
      if (
        f.endsWith(".adapter.js") ||
        f.endsWith(".helper.js") ||
        f === "dist"
      ) {
        const fullP = path.join(outDir, f);
        if (fs.statSync(fullP).isDirectory()) {
          fs.rmSync(fullP, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullP);
        }
        removedCount++;
      }
    }
    const schemasP = path.join(outDir, "schemas");
    if (fs.existsSync(schemasP)) {
      fs.rmSync(schemasP, { recursive: true, force: true });
      removedCount++;
    }
    if (removedCount > 0) {
      console.log(
        `  ✓ Cleaned up ${removedCount} exposed source files/folders from ${path.relative(cwd, outDir)}`
      );
    }
  }

  if (isDeploy) {
    // Generate README for standalone deployment
    const readmeContent =
      `# ${adapterName.toUpperCase()} Commerce Adapter (Pre-compiled Bundle)\n\n` +
      `This folder contains the pre-compiled, optimized executable bundle for the **${adapterName}** commerce adapter.\n\n` +
      `## Files:\n` +
      `- **index.js**: Standalone executable adapter bundle\n` +
      `- **adapter.json**: Manifest containing capabilities, version, and entrypoint\n\n` +
      `## Usage in Standalone Server:\n` +
      `1. Place this \`${adapterName}\` folder into \`dist/adapters/${adapterName}\`.\n` +
      `2. Set \`"commerce": { "adapter": "${adapterName}" }\` in \`store-config.json\`.\n` +
      `3. Start the standalone server (\`node server.js\`).\n`;
    fs.writeFileSync(path.join(outDir, "README.md"), readmeContent, "utf-8");
  }

  console.log(`\n==================================================`);
  console.log(` Adapter [${adapterName}] built and protected successfully!`);
  console.log(` Location: ${outDir}`);
  console.log(`==================================================\n`);

  return outDir;
}

export async function buildAllAdapters(options = {}) {
  const cwd = process.cwd();
  const sourceBases = [
    path.resolve(cwd, "src", "adapters-source"),
    path.resolve(cwd, "src", "adapters"),
  ];

  const foundAdapters = new Set();
  for (const base of sourceBases) {
    if (fs.existsSync(base)) {
      const entries = fs.readdirSync(base);
      for (const entry of entries) {
        const full = path.join(base, entry);
        if (
          fs.statSync(full).isDirectory() &&
          !["models", "loader", "schemas", "registry"].includes(entry)
        ) {
          foundAdapters.add(entry);
        }
      }
    }
  }

  const adaptersToBuild =
    foundAdapters.size > 0 ? Array.from(foundAdapters) : KNOWN_ADAPTERS;
  console.log(`Building all detected adapters: [${adaptersToBuild.join(", ")}]...`);

  for (const adapter of adaptersToBuild) {
    try {
      await buildAdapter(adapter, options);
    } catch (err) {
      console.error(`Failed to build adapter [${adapter}]:`, err.message);
    }
  }
}

// Allow direct CLI execution
const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(
      new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
    );

if (isCli || process.argv.includes("--run")) {
  const deploy = process.argv.includes("--deploy");
  const all = process.argv.includes("--all");
  const adapterArg = process.argv
    .slice(2)
    .find((arg) => !arg.startsWith("--"));

  if (all || (!adapterArg && !process.argv.includes("--run"))) {
    buildAllAdapters({ deploy }).catch((err) => {
      console.error("Adapters build failed:", err);
      process.exit(1);
    });
  } else {
    const target = adapterArg || "medusa";
    buildAdapter(target, { deploy }).catch((err) => {
      console.error(`Adapter [${target}] build failed:`, err);
      process.exit(1);
    });
  }
}
