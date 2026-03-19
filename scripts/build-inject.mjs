import { build } from "esbuild";

const requireBanner = [
  'import { createRequire } from "node:module";',
  "const require = createRequire(import.meta.url);",
].join("\n");

const entryPoints = [
  {
    entry: "src/import.ts",
    outfile: "dist/import.js",
  },
  {
    entry: "src/register.ts",
    outfile: "dist/register.js",
  },
];

for (const { entry, outfile } of entryPoints) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    packages: "bundle",
    banner: {
      js: requireBanner,
    },
    logLevel: "info",
  });
}
