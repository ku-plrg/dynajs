// @type concolic-replay
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "bbb")
  if (symbolic.charAt(0) !== 'a') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
