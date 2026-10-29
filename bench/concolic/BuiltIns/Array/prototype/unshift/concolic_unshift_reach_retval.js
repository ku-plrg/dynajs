// @type concolic-replay
// @target es5 Array.prototype.unshift
// @feature builtin unshift
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2,3])
  if (symbolic.unshift(0) === 4) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
