// @type concolic-replay
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.endsWith('abc') && symbolic.length === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "zabc"));
