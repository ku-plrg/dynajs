// @type concolic-replay
// @target es5 String
// @feature builtin String
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", -3)
  if (String(symbolic) === '-3') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", 7));
