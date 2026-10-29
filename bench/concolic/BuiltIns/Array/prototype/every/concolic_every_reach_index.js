// @type concolic-replay
// @target es5 Array.prototype.every
// @feature builtin every
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [0,1])
  if (symbolic.every(function (x, i) { return x === i; })) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
