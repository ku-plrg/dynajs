// @type concolic-replay
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "7bc")
  if (symbolic.codePointAt(0) === 55) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
