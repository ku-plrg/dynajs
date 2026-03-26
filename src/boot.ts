import { type CallbackHint, callbackHintEmpty } from "./partial.js";
import { warn } from "./utils.js";

export function checkAnalysisHooks(fullOpt: boolean): CallbackHint | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: CallbackHint = { ...callbackHintEmpty }; 
  const keys = Object.keys(callbackHintEmpty) as (keyof typeof callbackHintEmpty)[];
  for (const callbackName of keys) {
    if (callbackName in analysis) { tags[callbackName] = true; }
    else { warn(`unknown analysis callback name \`${callbackName}\` detected. Is this a typo?`); }
  }
  return tags;
}