import { type CallbackHint, callbackHintEmpty } from "./partial.js";
import { warn } from "./utils.js";

export function checkAnalysisHooks(fullOpt: boolean): CallbackHint | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: CallbackHint = { ...callbackHintEmpty };
  const validKeys = Object.keys(callbackHintEmpty) as (keyof typeof callbackHintEmpty)[];
  const live = new Set<string>();
  for (let o = analysis; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
    for (const k of Object.getOwnPropertyNames(o)) {
      if (k === 'constructor') continue;
      live.add(k);
    }
  }
  for (const maybeCallbackName of live) {
    if (validKeys.includes(maybeCallbackName as keyof CallbackHint)) { tags[maybeCallbackName as keyof CallbackHint] = true; }
    else { warn(`unknown analysis callback name \`${maybeCallbackName}\` detected. Is this a typo?`); }
  }
  return tags;
}