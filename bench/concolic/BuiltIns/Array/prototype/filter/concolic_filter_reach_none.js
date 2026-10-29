// @type concolic-replay
// @target es5 Array.prototype.filter
// @feature builtin filter
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2])
  if (symbolic.filter(function (x) { return x > 5; }).length === 0) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [9,2]));
