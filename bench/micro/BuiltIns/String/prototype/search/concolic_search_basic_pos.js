// @type concolic
// @target es5 String.prototype.search
// @feature builtin search
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.search(/b/) === 1) {
    // @witness /b/ first matches at index 1, so char 1 is 'b'
    __symbolic_assert__(symbolic[1] === 'b', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
