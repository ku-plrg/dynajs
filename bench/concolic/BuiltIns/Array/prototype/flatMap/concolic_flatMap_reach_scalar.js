// @type concolic-replay
// @target es6+ Array.prototype.flatMap
// @feature builtin flatMap
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.flatMap(function (x) { return x + 1; })[0] === 10) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
