import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// List of polyfill file names (extension .ts can be omitted).
// To use with different ESMETA_HOME: ESMETA_HOME=~/path/to/esmeta npm run copy
const FILES = [
  // "ToString",
  // "GetSubstitution",
  "INTRINSICS.String.prototype.at",
  "INTRINSICS.String.prototype.charAt",
];

const ESMETA_HOME = process.env.ESMETA_HOME;
if (!ESMETA_HOME) {
  console.error(chalk.red("✗ ESMETA_HOME is not set."));
  process.exit(1);
}

if (FILES.length === 0) {
  console.error(
    chalk.yellow(
      "No files specified. Fill in the FILES array in scripts/copy-polyfill.mjs.",
    ),
  );
  process.exit(1);
}

// Generate polyfills in ESMETA_HOME first.
console.log(chalk.cyan(`▶ Running gen-poly (${ESMETA_HOME})`));
execSync('sbt "run gen-poly -silent -gen-poly:log"', {
  cwd: ESMETA_HOME,
  stdio: "inherit",
});

const srcDir = join(ESMETA_HOME, "logs", "polyfill");
if (!existsSync(srcDir)) {
  console.error(chalk.red(`✗ Source directory not found: ${srcDir}`));
  process.exit(1);
}

const destDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "model",
  "spec",
);
mkdirSync(destDir, { recursive: true });

// Before copying, clear existing .ts files in the destination (keep .gitkeep, etc.).
// However, files with comments starting with @manual are considered manually written and are not deleted.
const MANUAL_MARKER = /(?:\/\/|\/\*)\s*@manual\b/;
for (const entry of readdirSync(destDir)) {
  if (!entry.endsWith(".ts")) continue;
  const path = join(destDir, entry);
  if (MANUAL_MARKER.test(readFileSync(path, "utf8"))) continue;
  rmSync(path);
}

const missing = [];
let copied = 0;
for (const name of FILES) {
  const file = name.endsWith(".ts") ? name : `${name}.ts`;
  const from = join(srcDir, file);
  if (!existsSync(from)) {
    missing.push(file);
    continue;
  }
  const to = join(destDir, file);
  // Warn if overwriting a `@manual` file, which is considered a manually written file.
  if (existsSync(to) && MANUAL_MARKER.test(readFileSync(to, "utf8"))) {
    console.error(
      chalk.red(`✗ Overwriting @manual file: ${file}`),
    );
  }
  cpSync(from, to);
  copied++;
}

if (missing.length > 0) {
  console.error(
    chalk.red(`✗ ${missing.length} file(s) not found:`),
    missing.join(", "),
  );
}

console.log(
  chalk.green(`✓ Copied ${copied} polyfill file(s) → src/model/polyfill/`),
);
if (missing.length > 0) process.exit(1);
