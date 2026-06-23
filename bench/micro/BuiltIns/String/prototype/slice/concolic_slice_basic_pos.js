// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.slice(1, 3) === 'bc') {
    // @witness the slice(1,3)==='bc' guard pins chars 1,2 to 'b','c'
    __IS_SAT__(!(symbolic[1] === 'b' && symbolic[2] === 'c'), false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
