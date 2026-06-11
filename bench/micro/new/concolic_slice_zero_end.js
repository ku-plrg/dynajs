// @type concolic
// @oracle true
// @target es5 string-slice
// @feature builtin slice-zero-end
// Mirrors ExpoSE string-model-bugs bug 6: a model that tests `if (args[1])` treats
// the falsy end index 0 as "no argument" and degrades slice(1,0) to slice(1). In
// real JS slice(1,0) is ALWAYS "" (end <= start), so `s.slice(1,0) === ""` is
// provably valid for every s. The buggy slice(1) model finds non-empty witnesses
// and reports a spurious counterexample (clean). dynajs builds a zero-length
// window, so it should confirm validity.

var s = __symbolic__("s", "hello");
__symbolic_assert__(s.slice(1, 0) === "");
