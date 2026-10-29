// @type concolic-replay
// @target es5 Array.prototype.map
// @feature builtin map
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.map(function (x) { return x > 5 ? 1 : 0; })[0] === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
