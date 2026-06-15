// @type concolic
// @target es5 encodeuricomponent
// @feature builtin encodeURIComponent-concrete
// Mirrors ExpoSE else/bug18 (concrete pollution): ExpoSE's model has no else branch
// and returns undefined for a concrete argument, corrupting plain execution.
// Real JS: encodeURIComponent("a b") === "a%20b".

__symbolic_assert__(encodeURIComponent("a b") === "a%20b", true);
