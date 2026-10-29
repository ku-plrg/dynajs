// @type concolic-replay
// @target es5 String.prototype.strike
// @feature builtin strike
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.strike().length === 20) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ab"));
