import { type CallbackHint, callbackHintEmpty } from "./partial.js";

export function checkAnalysisHooks(fullOpt: boolean): CallbackHint | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: CallbackHint = { ...callbackHintEmpty }; 
  const keys = Object.keys(callbackHintEmpty) as (keyof typeof callbackHintEmpty)[];
  for (const callbackName of keys) {
    if (callbackName in analysis) { tags[callbackName] = true; }
  }
  return tags;
}