// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)*(world)*$/.test(symbolic)) {
    // @witness /^(hello)*(world)*$/ needs whole "hello"/"world" blocks, so the truncated "hellohelloworl" never matches
    __IS_SAT__(symbolic === "hellohelloworl", false);
  }
}

__test_symbolic__(__symbolic__("s", "hello"));
