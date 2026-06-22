// @type concolic
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.repeat(5) == "HHHHH") {

    // @witness symbolic must be "H"
    __symbolic_assert__(symbolic === "H", true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
