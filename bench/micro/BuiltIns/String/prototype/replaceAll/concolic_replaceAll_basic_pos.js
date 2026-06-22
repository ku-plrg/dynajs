// @type concolic
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.replaceAll('z', 'Y');
  if (r === symbolic) {
    // @witness 'z' is absent since replaceAll is identity
    __symbolic_assert__(symbolic[0] !== 'z', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "aac"));
