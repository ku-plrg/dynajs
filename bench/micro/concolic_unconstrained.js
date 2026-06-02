// @type concolic
// @oracle false
// @target es5 binary-relational
// @feature syntax no-path-condition
// With no branch guarding it, the assert sees an empty path condition, so
// `x === 2` is trivially violable (any x != 2 is a counterexample).

var x = __symbolic__("x", 7);
__symbolic_assert__(x === 2);
