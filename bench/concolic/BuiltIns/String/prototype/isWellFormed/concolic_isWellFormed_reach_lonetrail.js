// @type concolic-replay
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "a\uDC00")
  if (symbolic.isWellFormed() === false && symbolic.length === 2) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
