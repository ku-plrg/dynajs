// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-substitution-dollar

function __test_symbolic__(symbolic) {
  var x = symbolic.replace(/(.*)/, "$1$1");
  if (x === symbolic + symbolic) {
    // @witness "$1$1" doubles the (.*) capture of the whole string, so x always equals symbolic + symbolic
    __IS_SAT__(x !== symbolic + symbolic, false);
  }
}

__test_symbolic__(__symbolic__('s', "ab"));
