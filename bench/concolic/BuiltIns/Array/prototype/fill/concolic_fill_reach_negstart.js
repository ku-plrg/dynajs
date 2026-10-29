// @type concolic-replay
// @target es6+ Array.prototype.fill
// @feature builtin fill
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.fill(0, -1);
  // @witness S$.symbol("s", [9,2])
  if (symbolic[0] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
