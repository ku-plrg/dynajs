// @type concolic
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.repeat(5) == "HHHHH") {

    // @witness the repeat(5)=="HHHHH" guard pins symbolic to "H"
    __IS_SAT__(symbolic !== "H", false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
