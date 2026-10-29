// @type concolic-replay
// @target es5 Array.prototype.some
// @feature builtin some
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","z"])
  if (symbolic.some(function (x) { return x === 'z'; })) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
