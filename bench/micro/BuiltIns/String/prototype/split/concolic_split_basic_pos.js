// @type concolic
// @target es5 String.prototype.split
// @feature builtin split
// @done


function __test_symbolic__(symbolic) {

  var p = symbolic.split('-');
  if (p[0] === 'ab') {
    // @witness the first segment 'ab' is the source prefix, so char 0 is 'a'
    __symbolic_assert__(symbolic[0] === 'a', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "ab-c"));
