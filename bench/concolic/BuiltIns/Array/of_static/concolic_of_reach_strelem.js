// @type concolic-replay
// @target es6+ Array.of
// @feature builtin of
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "x")
  if (Array.of(symbolic)[0] === 'x') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
