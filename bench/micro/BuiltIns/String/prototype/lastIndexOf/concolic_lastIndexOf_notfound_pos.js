// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('z') === -1) {
    // @witness the lastIndexOf('z')===-1 guard means no 'z' anywhere
    __IS_SAT__(symbolic[0] === 'z', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
