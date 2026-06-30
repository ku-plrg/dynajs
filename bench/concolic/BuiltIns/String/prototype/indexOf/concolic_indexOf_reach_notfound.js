// @type concolic-replay
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "bcd")
  if (symbolic.indexOf('a') === -1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
