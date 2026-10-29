// @type concolic-replay
// @target es6+ Array.prototype.copyWithin
// @feature builtin copyWithin
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.copyWithin(0, 1);
  // @witness S$.symbol("s", [1,2,9])
  if (symbolic[1] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2,3]));
