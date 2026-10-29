// @type concolic-replay
// @target es6+ Array.prototype.toSorted
// @feature builtin toSorted
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,3])
  if (symbolic.toSorted(function (a, b) { return a - b; })[0] === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [5,7]));
