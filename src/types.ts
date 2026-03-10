
// -----------------------------------------------------------------------------
// adaptive instrumentation: parse analysis file to determine needed hooks
// -----------------------------------------------------------------------------


// Maps each analysis callback name to the runtime feature tags it requires.
// Most callbacks need exactly one tag, but callbacks that sit higher in the
// hierarchy (e.g. invokeFun) also require their specialised variants
// (e.g. taggedTemplate) because those variants coerce their args and fire
// the parent callback too.
export const CALLBACK_TO_FEATURES = {
  scriptEnter:       ['Se'],
  scriptExit:        ['Se'],
  // invokeFun hooks also cover tagged-template call sites (TF/TM coerce to F/M)
  invokeFunPre:      ['F', 'TF'],
  invokeFun:         ['F', 'TF'],
  taggedTemplatePre: ['TF'],
  taggedTemplate:    ['TF'],
  functionEnter:     ['Fe'],
  functionExit:      ['Fe'],
  _return:           ['Re'],
  getFieldPre:       ['G'],
  getField:          ['G'],
  putFieldPre:       ['P'],
  putField:          ['P'],
  unaryPre:          ['U'],
  unary:             ['U'],
  binaryPre:         ['B'],
  binary:            ['B'],
  condition:         ['C'],
  declare:           ['D'],
  read:              ['R'],
  write:             ['W'],
  literal:           ['L'],
  endExpression:     ['E'],
  _throw:            ['Th'],
  _yield:            ['Y'],
  _await:            ['Aw'],
  forInOfObject:     ['O'],
  fieldInit:         ['Fi'],
  staticBlockEnter:  ['SBe'],
  staticBlockExit:   ['SBe'],
  _deletePre:        ['De'],
  _delete:           ['De'],
} as const;

export type FeatureTag = typeof CALLBACK_TO_FEATURES[keyof typeof CALLBACK_TO_FEATURES][number];

export type FeatureTagCheck = Record<FeatureTag, boolean>;

export const FEATURE_CHECK_ALL_FALSE: FeatureTagCheck = Object.fromEntries(
  Object.values(CALLBACK_TO_FEATURES).flat().map<[FeatureTag, boolean]>(tag => [tag, false])
) as FeatureTagCheck;

export const FEATURE_CHECK_ALL_TRUE: FeatureTagCheck = Object.fromEntries(
  Object.values(CALLBACK_TO_FEATURES).flat().map<[FeatureTag, boolean]>(tag => [tag, true])
) as FeatureTagCheck;
