// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done

function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('b') === 0) {
    // @witness the indexOf('b')===0 guard pins index 0 to 'b'
    __IS_SAT__(symbolic[0] !== 'b', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "bca"));
