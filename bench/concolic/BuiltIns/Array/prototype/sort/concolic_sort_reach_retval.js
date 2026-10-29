// @type concolic-replay
// @target es5 Array.prototype.sort
// @feature builtin sort
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,1])
  if (symbolic.sort(function (a, b) { return a - b; })[1] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
