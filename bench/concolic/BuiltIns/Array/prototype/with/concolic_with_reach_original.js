// @type concolic-replay
// @target es6+ Array.prototype.with
// @feature builtin with
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.with(0, 9)[0] === symbolic[0]) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
