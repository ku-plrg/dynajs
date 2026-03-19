import { register } from "node:module";
import { pathToFileURL } from "node:url";

function registerLoader(): void {
  const DYNAJS_HOME = process.env.DYNAJS_HOME || __dirname;
  register("./register.js", pathToFileURL(`${DYNAJS_HOME}/dist/`));
}

function main(): void {

  registerLoader();
}
// set globalThis
// globalThis.b = 17;

main();