// @type concolic-replay
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.isWellFormed()) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "\uD800"));
