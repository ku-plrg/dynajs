// @type concolic-replay
// @target es5 Array.prototype.every
// @feature builtin every
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [3,3])
  if (symbolic.every(function (x) { return x === 3; })) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
