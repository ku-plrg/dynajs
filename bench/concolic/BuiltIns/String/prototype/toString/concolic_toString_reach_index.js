// @type concolic-replay
// @target es5 String.prototype.toString
// @feature builtin toString
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "aqc")
  if (symbolic.toString()[1] === 'q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
