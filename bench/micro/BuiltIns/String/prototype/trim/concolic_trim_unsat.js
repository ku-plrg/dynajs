// @type concolic
// @target es5 String.prototype.trim
// @feature builtin trim
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.trim().length === symbolic.length) {
  // @witness equal-length guard means no edge spaces, so the negation is impossible
    __IS_SAT__(!(symbolic[0] !== ' '&& symbolic[symbolic.length - 1] !== ' ') , false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "  abc  "));
