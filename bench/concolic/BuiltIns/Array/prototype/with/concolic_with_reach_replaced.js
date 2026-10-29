// @type concolic-replay
// @target es6+ Array.prototype.with
// @feature builtin with
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,9])
  if (symbolic.with(1, 5)[1] + symbolic[1] === 14) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
