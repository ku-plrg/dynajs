// @type concolic-replay
// @target es5 Array.prototype.pop
// @feature builtin pop
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.pop();
  // @witness S$.symbol("s", [7,8,9])
  if (symbolic.length === 2) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [7,8]));
