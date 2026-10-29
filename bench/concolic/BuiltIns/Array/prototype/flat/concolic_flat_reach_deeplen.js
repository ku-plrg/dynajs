// @type concolic-replay
// @target es6+ Array.prototype.flat
// @feature builtin flat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [5])
  if (symbolic.flat(2).length === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
