// @type concolic-replay
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "wxyz")
  if (symbolic.endsWith('wxyz')) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "xyz"));
