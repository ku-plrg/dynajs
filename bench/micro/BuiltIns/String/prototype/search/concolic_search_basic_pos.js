// @type concolic
// @target es5 String.prototype.search
// @feature builtin search
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.search(/b/) === 1) {
    // @witness the search(/b/)===1 guard pins index 1 to 'b'
    __IS_SAT__(symbolic[1] !== 'b', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
