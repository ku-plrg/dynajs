// @type concolic-replay
// @target es5 Array.isArray
// @feature builtin isArray
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [])
  if (Array.isArray(symbolic) && symbolic.length === 0) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1]));
