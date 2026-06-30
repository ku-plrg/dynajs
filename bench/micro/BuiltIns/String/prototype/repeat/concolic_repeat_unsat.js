// @type concolic
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.repeat(2) == "abcabc") {

    // @witness the repeat(2)=="abcabc" guard pins symbolic to "abc"
    __IS_SAT__(symbolic.repeat(3) !== "abcabcabc", false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
