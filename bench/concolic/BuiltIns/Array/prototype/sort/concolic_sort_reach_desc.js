// @type concolic-replay
// @target es5 Array.prototype.sort
// @feature builtin sort
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.sort(function (a, b) { return b - a; });
  // @witness S$.symbol("s", [1,9])
  if (symbolic[0] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
