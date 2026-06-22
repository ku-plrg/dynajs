// @type concolic
// @target es5 String.prototype.match
// @feature builtin match
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.match(/^a.c$/)) {
    // @witness anchored /^a.c$/ pins char 0 to 'a'
    __symbolic_assert__(symbolic[0] === 'a', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
