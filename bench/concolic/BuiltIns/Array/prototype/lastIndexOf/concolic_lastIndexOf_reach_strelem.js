// @type concolic-replay
// @target es5 Array.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","x"])
  if (symbolic.lastIndexOf('x') === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
