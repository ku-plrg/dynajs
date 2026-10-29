// @type concolic-replay
// @target es5 Array.prototype.sort
// @feature builtin sort
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.sort(function (a, b) { return a - b; });
  // @witness S$.symbol("s", [9,3])
  if (symbolic[0] === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [5,7]));
