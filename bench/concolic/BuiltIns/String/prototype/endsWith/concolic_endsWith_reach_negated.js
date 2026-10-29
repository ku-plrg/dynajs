// @type concolic-replay
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abd")
  if (symbolic.endsWith('c') === false) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
