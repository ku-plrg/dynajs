// @type concolic-replay
// @target es5 String.prototype.slice
// @feature builtin slice
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "xyz")
  if (symbolic.slice(-2) === 'yz') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
