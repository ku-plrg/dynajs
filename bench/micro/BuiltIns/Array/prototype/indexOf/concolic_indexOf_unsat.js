// @type concolic
// @target es5 Array.prototype.indexOf
// @feature builtin indexof
// @done

function __test_symbolic__(symbolic) {

  if (symbolic.indexOf(5) === 0) {
    // @witness the indexOf(5)===0 guard pins index 0 to 5
    __IS_SAT__(symbolic[0] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', [5]));
