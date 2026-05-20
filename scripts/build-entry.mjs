import { build } from "esbuild";
import chalk from "chalk";

const requireBanner = [
  'import { createRequire } from "node:module";',
  "const require = createRequire(import.meta.url);",
].join("\n");

const entryPoints = [
  {
    entry: "src/entry/import.ts",
    outfile: "dist/entry/import.js",
  },
  {
    entry: "src/entry/register.ts",
    outfile: "dist/entry/register.js",
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
    logLevel: "warning",
  });
}

console.log(chalk.green(`✓ built ${entryPoints.length} entries`));
