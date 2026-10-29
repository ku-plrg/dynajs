// @type concolic-replay
// @target es5 Array.prototype.reverse
// @feature builtin reverse
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.reverse();
  // @witness S$.symbol("s", ["a","z"])
  if (symbolic[0] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
