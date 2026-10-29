// @type concolic-replay
// @target es5 Array.prototype.unshift
// @feature builtin unshift
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.unshift(0);
  // @witness S$.symbol("s", [1,9])
  if (symbolic[2] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
