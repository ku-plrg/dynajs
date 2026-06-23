// @type concolic
// @target es5 String.prototype.match
// @feature builtin match
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.match(/^a.c$/)) {
    // @witness anchored /^a.c$/ match pins index 0 to 'a'
    __IS_SAT__(symbolic[0] !== 'a', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
