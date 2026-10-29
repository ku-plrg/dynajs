// @type concolic-replay
// @target es6+ Array.prototype.toSpliced
// @feature builtin toSpliced
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,9])
  if (symbolic.toSpliced(0, 1, 5)[1] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
