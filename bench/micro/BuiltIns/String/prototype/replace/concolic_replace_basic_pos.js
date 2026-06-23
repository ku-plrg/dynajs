// @type concolic
// @target es5 String.prototype.replace
// @feature builtin replace
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.replace('z', 'Y');
  if (r === symbolic) {
    // @witness identity path means 'z' was absent, so no index can be 'z'
    __IS_SAT__(symbolic[0] === 'z', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
