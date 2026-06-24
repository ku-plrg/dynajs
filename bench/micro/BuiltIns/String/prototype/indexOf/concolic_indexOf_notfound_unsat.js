// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('z') === -1) {
    // @witness the indexOf('z')===-1 guard means 'z' is absent everywhere
    __IS_SAT__(symbolic[0] === 'z', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
