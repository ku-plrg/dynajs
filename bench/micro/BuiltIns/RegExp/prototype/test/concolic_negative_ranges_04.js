// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[^abcd]$/.test(symbolic)) {
    // @witness negated class [^abcd] excludes "d", so the guard forbids symbolic === "d"
    __IS_SAT__(symbolic === "d", false);
  }
}

__test_symbolic__(__symbolic__("s", "#"));
