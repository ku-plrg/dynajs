// @type concolic-replay
// @target es5 Array.prototype.reduce
// @feature builtin reduce
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","b"])
  if (symbolic.reduce(function (a, v) { return a + v; }, '') === 'ab') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));
