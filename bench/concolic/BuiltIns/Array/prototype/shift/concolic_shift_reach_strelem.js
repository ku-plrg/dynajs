// @type concolic-replay
// @target es5 Array.prototype.shift
// @feature builtin shift
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["z","b"])
  if (symbolic.shift() === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
