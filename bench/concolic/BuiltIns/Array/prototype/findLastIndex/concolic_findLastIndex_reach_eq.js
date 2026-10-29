// @type concolic-replay
// @target es6+ Array.prototype.findLastIndex
// @feature builtin findLastIndex
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [4,2,3])
  if (symbolic.findLastIndex(function (x) { return x === 4; }) === 0) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2,3]));
