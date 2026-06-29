// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^Hello|Cookey$/.test(symbolic)) {
    // @witness __test_symbolic__("Cookey")
    __IS_SAT__(symbolic === "Cookey", true);
  }
}

__test_symbolic__(__symbolic__('s', "CookeyCookey"));
