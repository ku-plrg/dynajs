// @type concolic
// @target es5 json-stringify
// @feature builtin json-stringify-concrete
// Mirrors ExpoSE else/bug17 (concrete pollution): ExpoSE's hand-written stringify
// emits the literal "undefined" instead of omitting the key, producing invalid JSON.
// Real JS: JSON.stringify({a:undefined,b:1}) === '{"b":1}'.

__symbolic_assert__(JSON.stringify({ a: undefined, b: 1 }) === '{"b":1}', true);
