// @type concolic-replay
// @target es6+ Array.prototype.toReversed
// @feature builtin toReversed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","z"])
  if (symbolic.toReversed()[0] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
