import { CALLBACK_TO_FEATURES, FEATURE_CHECK_ALL_FALSE, FeatureTag, FeatureTagCheck } from "./partial.js";

export function checkAnalysisHooks(fullOpt: boolean): FeatureTagCheck | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: FeatureTagCheck = { ...FEATURE_CHECK_ALL_FALSE };
  for (const [callbackName, hookTags] of Object.entries(CALLBACK_TO_FEATURES)) {
    if (callbackName in analysis) {
      for (const tag of hookTags) tags[tag as FeatureTag] = true;
    }
  }
  return tags;
}