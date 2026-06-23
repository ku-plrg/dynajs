// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('b') === 2) {
    // @witness lastIndexOf('b')===2 guard forces char at index 2 to be 'b'
    __IS_SAT__(symbolic[2] !== 'b', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "aab"));
