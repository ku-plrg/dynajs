// @type concolic-replay
// @target es5 String.prototype.valueOf
// @feature builtin valueOf
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abcde")
  if (symbolic.valueOf().length === 5) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
