// @type concolic-replay
// @target es5 Array.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2])
  if (symbolic.lastIndexOf(5) === -1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [5,2]));
