// @type concolic-replay
// @target es5 Array.prototype.slice
// @feature builtin slice
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,9,3])
  if (symbolic.slice(1, 2)[0] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2,3]));
