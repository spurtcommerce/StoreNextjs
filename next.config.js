const fs = require("fs");
const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");

/** Create the plugin */
const withNextIntl = createNextIntlPlugin();

function getNonDefaultTemplateExcludes() {
  const templatesDir = path.resolve(process.cwd(), "templates");
  if (!fs.existsSync(templatesDir)) return [];
  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "default")
    .flatMap((d) => [`templates/${d.name}/**`, `**/templates/${d.name}/**`]);
}

function getAdapterExcludes() {
  const adaptersDir = path.resolve(process.cwd(), "src", "adapters");
  if (!fs.existsSync(adaptersDir)) return [];
  const keep = new Set(["models", "schemas", "registry", "__tests__", "common"]);
  return fs
    .readdirSync(adaptersDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !keep.has(d.name))
    .flatMap((d) => [`src/adapters/${d.name}/**`, `**/src/adapters/${d.name}/**`]);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "dist/**",
      "dist-template/**",
      "dist-adapter/**",
      "./dist/**",
      "./dist-template/**",
      "./dist-adapter/**",
      ...getAdapterExcludes(),
    ],
  },
  reactStrictMode: process.env.NODE_ENV === "development",
  serverExternalPackages: ["esbuild", "cheerio"],
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  webpack: (config, { dev, isServer, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@templates": path.resolve(process.cwd(), "templates"),
    };

    // Exclude documentation files from webpack processing
    config.module.rules.push({
      test: /\.(md|txt)$/,
      type: 'asset/source',
    });

    if (!dev) {
      const rootDir = process.cwd().replace(/\\/g, "/");
      const templatesPrefix = `${rootDir}/templates/`.toLowerCase();
      const adaptersPrefix = `${rootDir}/src/adapters/`.toLowerCase();
      const keepAdapters = new Set([
        "models",
        "schemas",
        "registry",
        "__tests__",
        "common",
        "index",
        "index.js",
      ]);

      // Production build: skip compiling pluggable commerce adapters (loaded at runtime
      // from dist/adapters/<name>), while compiling all templates with Next.js RSC support.
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            if (!resource) return false;
            const normRes = resource.replace(/\\/g, "/");
            const normCtx = (context || "").replace(/\\/g, "/");

            // Check @/adapters/<name>/... alias
            const atAdapter = normRes.match(/^@\/adapters\/([^/]+)/);
            if (atAdapter && !keepAdapters.has(atAdapter[1])) return true;

            // Resolve absolute or relative path to check against src/adapters/
            let resolved = normRes;
            if (normRes.startsWith(".") && normCtx) {
              resolved = path.resolve(normCtx, normRes).replace(/\\/g, "/");
            }
            const resolvedLower = resolved.toLowerCase();

            if (resolvedLower.startsWith(adaptersPrefix)) {
              const seg = resolvedLower.slice(adaptersPrefix.length).split("/")[0];
              if (seg && !keepAdapters.has(seg)) return true;
            }

            return false;
          },
        })
      );
    }

    if (isServer && !dev) {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.afterEmit.tap("NextProxyNftFix", () => {
            try {
              const serverDir = path.resolve(process.cwd(), ".next", "server");
              const mwNft = path.join(serverDir, "middleware.js.nft.json");
              const proxyNft = path.join(serverDir, "proxy.js.nft.json");
              if (fs.existsSync(mwNft) && !fs.existsSync(proxyNft)) {
                fs.copyFileSync(mwNft, proxyNft);
              }
              const nextDir = path.resolve(process.cwd(), ".next");
              const nextPkg = path.join(nextDir, "package.json");
              if (!fs.existsSync(nextPkg)) {
                fs.writeFileSync(nextPkg, JSON.stringify({ type: "commonjs" }, null, 2));
              }
            } catch {}
          });
        },
      });
    }

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/server/commerceSecrets": false,
        [path.resolve(process.cwd(), "src/lib/server/commerceSecrets.js")]: false,
        [path.resolve(process.cwd(), "src/lib/server/commerceSecrets")]: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        vm: false,
      };
    }
    if (dev) {
      // Prevent store-config.json / store-secrets.enc.json writes from triggering a full page reload
      const existing = config.watchOptions?.ignored;
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
          "**/store-config.json",
          "**/store-secrets.enc.json",
          "**/*.md",
          "**/README.md",
          "**/MIGRATION_GUIDE.md",
          "**/RESTRUCTURE_SUMMARY.md",
        ],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "spurtcart-image.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "image.spurtcart.com",
      },
      {
        protocol: "https",
        hostname: "d62ptsgk90y2j.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "oc.spurtb2c.store",
      },
      {
        protocol: "https",
        hostname: "*.spurtb2c.store",
      },
    ],
    qualities: [25, 50, 75, 100],
  },

  async rewrites() {
    return [
      {
        source: "/templates/:id/:asset*",
        destination: "/api/templates/:id/:asset*",
      },
      {
        source: "/opencart/index.php/api/v1/:path*",
        destination: "http://localhost/opencart/api/v1/:path*",
      },
      {
        source: "/opencart/:path*",
        destination: "http://localhost/opencart/:path*",
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "@headlessui/react",
      "react-icons",
      "@material-tailwind/react",
    ],
  },
};

/** Wrap config */
module.exports = withNextIntl(nextConfig);

