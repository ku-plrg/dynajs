// @type concolic-replay
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "b")
  if (symbolic.startsWith('a') === false) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
