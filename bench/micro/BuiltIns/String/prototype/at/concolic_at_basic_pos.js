// @type concolic
// @target es6+ String.prototype.at
// @feature builtin at
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.at(1) === 'a') {
    // @witness at(1)==='a' requires index 1 to exist, so length>1
    __symbolic_assert__(symbolic.length > 1, true);
  } else {
    __symbolic_assert__(false, true);
  }


}

__test_symbolic__(__symbolic__('s', "aaa"));
