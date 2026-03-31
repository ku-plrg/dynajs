import { type CallbackHint, callbackHintEmpty } from "./partial.js";
import { warn } from "./utils.js";

export function checkAnalysisHooks(fullOpt: boolean): CallbackHint | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: CallbackHint = { ...callbackHintEmpty }; 
  const validKeys = Object.keys(callbackHintEmpty) as (keyof typeof callbackHintEmpty)[];
  const live = new Set(Object.keys(analysis));
  for (const maybeCallbackName of live) {
    if (validKeys.includes(maybeCallbackName as keyof CallbackHint)) { tags[maybeCallbackName as keyof CallbackHint] = true; }
    else { warn(`unknown analysis callback name \`${maybeCallbackName}\` detected. Is this a typo?`); }
  }
  return tags;
}