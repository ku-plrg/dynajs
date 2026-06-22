// @type concolic
// @target es5 String.prototype.replace
// @feature builtin replace
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.replace('z', 'Y');
  if (r === symbolic) {
    // @witness 'z' is absent since replace is identity
    __symbolic_assert__(symbolic[0] !== 'z', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
