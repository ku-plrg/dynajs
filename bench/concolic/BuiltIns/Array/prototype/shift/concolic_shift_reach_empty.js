// @type concolic-replay
// @target es5 Array.prototype.shift
// @feature builtin shift
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [])
  if (symbolic.shift() === undefined) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1]));
