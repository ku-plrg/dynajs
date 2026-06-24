// @type concolic
// @target es6+ String.prototype.at
// @feature builtin at
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.at(1) === 'a') {
    // @witness the at(1)==='a' guard requires index 1, forcing length>=2
    __IS_SAT__(symbolic.length <= 1, false);
  } else {
    __IS_SAT__(true, false);
  }


}

__test_symbolic__(__symbolic__('s', "aaa"));
