import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// Stage the hand-authored @manual spec files. src/model/spec/ is `*`-ignored
// (see its .gitignore) so generated files never clutter `git status`; the cost
// is that @manual files are ignored too and must be force-added. They can't be
// told apart from generated files by name (all are AO__*.ts), so we select them
// by the @manual marker — same regex scripts/copy-polyfill.mjs uses to preserve
// them — and `git add -f` each one.
const MANUAL_MARKER = /(?:\/\/|\/\*)\s*@manual\b/;

const specDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "model",
  "spec",
);

const manualFiles = [];
for (const entry of readdirSync(specDir)) {
  if (!entry.endsWith(".ts")) continue;
  const path = join(specDir, entry);
  if (MANUAL_MARKER.test(readFileSync(path, "utf8"))) manualFiles.push(path);
}

if (manualFiles.length === 0) {
  console.log(chalk.yellow("No @manual files found in src/model/spec/."));
  process.exit(0);
}

// `-f` to override the `*` gitignore; `--` so paths are never read as options.
// add is content-based: unchanged tracked files are a no-op, so force-adding
// the full set never invents a spurious staged change.
execFileSync("git", ["add", "-f", "--", ...manualFiles], { stdio: "inherit" });

// Report only what actually landed in the index — `git add` skips unchanged
// files, so listing every candidate would overstate what was staged.
const staged = execFileSync(
  "git",
  ["diff", "--cached", "--name-only", "--", ...manualFiles],
  { encoding: "utf8" },
)
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const upToDate = manualFiles.length - staged.length;
if (staged.length === 0) {
  console.log(
    chalk.green(
      `✓ Nothing to stage — all ${manualFiles.length} @manual file(s) up to date.`,
    ),
  );
} else {
  console.log(chalk.green(`✓ Staged ${staged.length} changed @manual file(s):`));
  for (const path of staged.sort()) console.log(chalk.gray(`  ${path}`));
  if (upToDate > 0)
    console.log(chalk.gray(`  (${upToDate} already up to date)`));
}
