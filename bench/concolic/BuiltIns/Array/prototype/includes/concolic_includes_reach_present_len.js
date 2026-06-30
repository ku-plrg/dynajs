// @type concolic-replay
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2,3])
  if (symbolic.includes(3) && symbolic.length === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [3]));
