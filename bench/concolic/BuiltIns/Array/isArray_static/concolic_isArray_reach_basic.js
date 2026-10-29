// @type concolic-replay
// @target es5 Array.isArray
// @feature builtin isArray
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2,3])
  if (Array.isArray(symbolic) && symbolic.length === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
