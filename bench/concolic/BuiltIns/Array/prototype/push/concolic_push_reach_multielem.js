// @type concolic-replay
// @target es5 Array.prototype.push
// @feature builtin push
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.push(8, 9);
  // @witness S$.symbol("s", [1,2])
  if (symbolic[3] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1]));
