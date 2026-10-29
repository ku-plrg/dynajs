// @type concolic-replay
// @target es5 Array.prototype.splice
// @feature builtin splice
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.splice(-1, 1);
  // @witness S$.symbol("s", [9,2])
  if (symbolic[0] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
