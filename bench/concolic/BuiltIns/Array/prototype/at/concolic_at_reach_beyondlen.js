// @type concolic-replay
// @target es6+ Array.prototype.at
// @feature builtin at
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,2,3])
  if (symbolic.at(2) !== undefined) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
