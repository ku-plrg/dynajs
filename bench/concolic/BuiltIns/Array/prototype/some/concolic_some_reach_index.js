// @type concolic-replay
// @target es5 Array.prototype.some
// @feature builtin some
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,6])
  if (symbolic.some(function (x, i) { return x === i + 5; })) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
