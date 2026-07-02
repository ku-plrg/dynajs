import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This file lives at <repo>/tests/support/paths.mjs, so the repo root — which is
// also what DYNAJS_HOME must point at — is two directories up. Deriving it from
// import.meta.url (never from process.cwd()) keeps the suite correct inside git
// worktrees, where the built dist/ lives alongside these tests, not in the main
// checkout.
export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

export const dynajsBin = path.join(repoRoot, 'dynajs');
export const harnessPath = path.join(repoRoot, 'tests', 'harness.js');
