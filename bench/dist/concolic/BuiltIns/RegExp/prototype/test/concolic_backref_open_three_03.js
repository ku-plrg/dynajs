// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness (([1-9])\4)+ requires at least one doubled-digit unit, absent from "aa"
    __IS_SAT__(symbolic === "aa", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
