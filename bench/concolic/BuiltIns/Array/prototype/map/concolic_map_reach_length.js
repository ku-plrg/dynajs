// @type concolic-replay
// @target es5 Array.prototype.map
// @feature builtin map
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2,3])
  if (symbolic.map(function (x) { return x * 2; }).length === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
