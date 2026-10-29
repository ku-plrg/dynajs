// @type concolic-replay
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abd")
  if (symbolic.codePointAt(2) === 100) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
