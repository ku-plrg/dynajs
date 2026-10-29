// @type concolic-replay
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "")
  if (symbolic.isWellFormed() && symbolic.length === 0) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
