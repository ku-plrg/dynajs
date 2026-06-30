// @type concolic-replay
// @target es6+ String.prototype.includes
// @feature builtin includes
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "xyz")
  if (symbolic.includes('xy')) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
