// @type concolic-replay
// @target es5 String.prototype.substr
// @feature builtin substr
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abcde")
  if (symbolic.substr(-2) === 'de') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
