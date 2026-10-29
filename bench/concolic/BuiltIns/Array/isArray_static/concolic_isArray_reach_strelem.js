// @type concolic-replay
// @target es5 Array.isArray
// @feature builtin isArray
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","z"])
  if (Array.isArray(symbolic) && symbolic[1] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));
