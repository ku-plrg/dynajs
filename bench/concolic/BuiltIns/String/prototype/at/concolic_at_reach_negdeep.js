// @type concolic-replay
// @target es6+ String.prototype.at
// @feature builtin at
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "zbc")
  if (symbolic.at(-3) === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
