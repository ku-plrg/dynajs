// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[^abcd]$/.test(symbolic)) {
    // @witness negated class [^abcd] excludes "a", so the guard forbids symbolic === "a"
    __IS_SAT__(symbolic === "a", false);
  }
}

__test_symbolic__(__symbolic__("s", "#"));
