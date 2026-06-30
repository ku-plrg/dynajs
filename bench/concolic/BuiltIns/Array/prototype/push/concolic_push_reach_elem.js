// @type concolic-replay
// @target es5 Array.prototype.push
// @feature builtin push
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.push(42);
  // @witness S$.symbol("s", [7,8])
  if (symbolic[2] === 42) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [7]));
