// @type concolic-replay
// @target es5 Array.prototype.unshift
// @feature builtin unshift
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.unshift('a');
  // @witness S$.symbol("s", ["z","y"])
  if (symbolic[1] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));
