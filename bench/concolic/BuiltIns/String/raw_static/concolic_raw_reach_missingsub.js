// @type concolic-replay
// @target es6+ String.raw
// @feature builtin raw
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "x")
  if (String.raw({ raw: [symbolic, 'b', 'c'] }, 1) === 'x1bc') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
