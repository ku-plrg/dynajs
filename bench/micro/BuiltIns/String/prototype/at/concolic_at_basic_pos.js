// @type concolic
// @target es6+ String.prototype.at
// @feature builtin at
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.at(1) === 'a') {
    // @witness the at(1)==='a' guard pins index 1 to 'a'
    __IS_SAT__(symbolic[1] !== 'a', false);
  } else {
    __IS_SAT__(true, false);
  }


}

__test_symbolic__(__symbolic__('s', "aaa"));
