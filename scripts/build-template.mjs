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

const KNOWN_ENTRIES = [
  "RootPage.jsx",
  "Layout.jsx",
  "ProductListPage.jsx",
  "ProductDetailPage.jsx",
  "FooterPageDetail.jsx",
  "AccountVerification.jsx",
  "Component/Settings/index.jsx",
  "Component/Settings/SettingsSidebar.jsx",
];

export async function buildTemplate(templateName = "horizon", options = {}) {
  const cwd = process.cwd();
  const templateDir = path.resolve(cwd, "templates", templateName);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const outDir = options.outDir || (options.deploy
    ? path.resolve(cwd, "dist", "templates", templateName)
    : path.resolve(cwd, "dist-template", templateName));

  const serverOutDir = path.join(outDir, "dist", "server");
  fs.mkdirSync(serverOutDir, { recursive: true });

  console.log(`\n==================================================`);
  console.log(` Building Template: [${templateName}]`);
  console.log(` Source: ${templateDir}`);
  console.log(` Output: ${outDir}`);
  console.log(`==================================================\n`);

  // Detect which entries exist in this template
  const foundEntries = [];
  for (const entry of KNOWN_ENTRIES) {
    const full = path.join(templateDir, entry);
    if (fs.existsSync(full)) {
      foundEntries.push(entry);
    } else {
      // Check .js extension if .jsx wasn't found
      const jsVariant = entry.replace(/\.jsx$/, ".js");
      const fullJs = path.join(templateDir, jsVariant);
      if (fs.existsSync(fullJs)) {
        foundEntries.push(jsVariant);
      }
    }
  }

  // Also check any other top-level .jsx/.js files
  const topFiles = fs.readdirSync(templateDir);
  for (const f of topFiles) {
    if (/\.(jsx?|tsx?)$/i.test(f) && !foundEntries.includes(f)) {
      foundEntries.push(f);
    }
  }

  console.log(`Compiling ${foundEntries.length} template entry points...`);

  for (const entry of foundEntries) {
    const entryPath = path.join(templateDir, entry);
    const outFileName = entry.replace(/\.(jsx?|tsx?)$/i, ".js");
    const outFilePath = path.join(serverOutDir, outFileName);

    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });

    try {
      await esbuild.build({
        entryPoints: [entryPath],
        bundle: true,
        outfile: outFilePath,
        format: "cjs",
        platform: "node",
        loader: {
          ".js": "jsx",
          ".png": "dataurl",
          ".svg": "dataurl",
          ".jpg": "dataurl",
          ".jpeg": "dataurl",
          ".webp": "dataurl",
          ".css": "text",
        },
        plugins: [
          {
            name: "alias-and-externals",
            setup(build) {
              // Resolve @/... aliases to src/...
              build.onResolve({ filter: /^@\// }, (args) => {
                const raw = path.resolve(cwd, "src", args.path.replace(/^@\//, ""));
                const resolved = resolveWithExt(raw);
                return resolved ? { path: resolved } : { path: raw, external: true };
              });
              // Resolve @templates/... aliases to templates/...
              build.onResolve({ filter: /^@templates\// }, (args) => {
                const raw = path.resolve(cwd, args.path.replace(/^@templates\//, "templates/"));
                const resolved = resolveWithExt(raw);
                return resolved ? { path: resolved } : { path: raw, external: true };
              });
              // Keep external runtime packages external
              build.onResolve(
                { filter: /^(react|react-dom|next|framer-motion|lucide-react)(\/.*)?$/ },
                (args) => ({ path: args.path, external: true })
              );
            },
          },
        ],
        logLevel: "warning",
      });
      console.log(`  ✓ Compiled: ${entry} -> dist/server/${outFileName}`);
    } catch (err) {
      console.error(`  ✗ Failed compiling ${entry}:`, err.message);
    }
  }

  // Copy static assets
  console.log(`\nCopying template assets...`);
  const assetFiles = [
    "template.json",
    "style.css",
    "thumbnail.png",
    "preview.png",
  ];

  for (const file of assetFiles) {
    const src = path.join(templateDir, file);
    const dest = path.join(outDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied: ${file}`);
    }
  }

  // Copy mock directory if it exists
  const mockDir = path.join(templateDir, "mock");
  if (fs.existsSync(mockDir)) {
    const destMock = path.join(outDir, "mock");
    fs.cpSync(mockDir, destMock, { recursive: true });
    console.log(`  ✓ Copied: mock/ directory`);
  }

  console.log(`\n==================================================`);
  console.log(` Template [${templateName}] built successfully!`);
  console.log(` Location: ${outDir}`);
  console.log(` To use it: copy this folder into "dist/templates/${templateName}"`);
  console.log(`==================================================\n`);

  return outDir;
}

// Allow direct CLI execution
const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
if (isCli || process.argv.includes("--run")) {
  const templateArg = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "horizon";
  const deploy = process.argv.includes("--deploy");
  buildTemplate(templateArg, { deploy }).catch((err) => {
    console.error("Template build failed:", err);
    process.exit(1);
  });
}
