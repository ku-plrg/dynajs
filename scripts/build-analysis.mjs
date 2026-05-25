import { build } from "esbuild";
import chalk from "chalk";

const requireBanner = [
  'import { createRequire } from "node:module";',
  "const require = createRequire(import.meta.url);",
].join("\n");

const entryPoints = [
  {
    entry: "analyses/taint/src/index.ts",
    outfile: "analyses/dist/Taint.js",
  },
  {
    entry: "analyses/concolic/src/index.ts",
    outfile: "analyses/dist/Concolic.js",
  },
];

for (const { entry, outfile } of entryPoints) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node20",
    packages: "bundle",
    banner: {
      js: requireBanner,
    },
    tsconfig: "./analyses/tsconfig.json",
    logLevel: "warning",
  });
}

console.log(chalk.green(`✓ built ${entryPoints.length} analysis definitions`));
