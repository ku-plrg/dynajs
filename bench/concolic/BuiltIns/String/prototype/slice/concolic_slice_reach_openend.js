// @type concolic-replay
// @target es5 String.prototype.slice
// @feature builtin slice
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abcd")
  if (symbolic.slice(1) === 'bcd') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
