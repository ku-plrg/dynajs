// @type concolic-replay
// @target es6+ String.fromCodePoint
// @feature builtin fromCodePoint
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", 32)
  if (String.fromCodePoint(symbolic) === ' ') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", 97));
