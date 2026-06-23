// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)*(world)*$/.test(symbolic)) {
    // @witness /^(hello)*(world)*$/ only matches repeats of "hello"/"world", so a lone "d" never reaches this branch
    __IS_SAT__(symbolic === "d", false);
  }
}

__test_symbolic__(__symbolic__("s", "hello"));
