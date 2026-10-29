// @type concolic-replay
// @target es5 Array.prototype.toString
// @feature builtin toString
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","b"])
  if (symbolic.toString() === 'a,b') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));
