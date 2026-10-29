// @type concolic-replay
// @target es6+ Array.prototype.findLastIndex
// @feature builtin findLastIndex
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,9])
  if (symbolic.findLastIndex(function (x) { return x > 5; }) === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [9,2]));
