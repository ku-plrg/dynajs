// @type concolic-replay
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "\uD83D\uDE00")
  if (symbolic.toWellFormed() === '\uD83D\uDE00') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
