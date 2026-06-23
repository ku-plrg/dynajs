import { type CallbackHint, callbackHintEmpty } from './partial.js';
import { warn } from './utils.js';

export function checkAnalysisHooks(fullOpt: boolean): CallbackHint | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: CallbackHint = { ...callbackHintEmpty };
  const validKeys = Object.keys(
    callbackHintEmpty,
  ) as (keyof typeof callbackHintEmpty)[];
  const live = new Set<string>();
  for (
    let o = analysis;
    o && o !== Object.prototype;
    o = Object.getPrototypeOf(o)
  ) {
    for (const k of Object.getOwnPropertyNames(o)) {
      if (k === 'constructor') continue;
      live.add(k);
    }
  }
  const unknown: string[] = [];
  for (const maybeCallbackName of live) {
    if (validKeys.includes(maybeCallbackName as keyof CallbackHint)) {
      tags[maybeCallbackName as keyof CallbackHint] = true;
    } else {
      unknown.push(maybeCallbackName);
    }
  }
  if (unknown.length > 0) {
    warn(
      `unknown analysis callback name(s) detected: ${unknown.map((n) => `\`${n}\``).join(', ')}. Typo?`,
    );
  }
  return tags;
}
