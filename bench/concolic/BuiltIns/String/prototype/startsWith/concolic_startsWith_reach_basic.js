// @type concolic-replay
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abz")
  if (symbolic.startsWith('ab')) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "xyz"));
