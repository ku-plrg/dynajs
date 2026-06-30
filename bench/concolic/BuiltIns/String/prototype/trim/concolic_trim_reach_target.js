// @type concolic-replay
// @target es5 String.prototype.trim
// @feature builtin trim
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "  hi  ")
  if (symbolic.trim() === 'hi') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "  abc  "));
