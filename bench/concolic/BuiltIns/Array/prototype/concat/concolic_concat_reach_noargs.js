// @type concolic-replay
// @target es5 Array.prototype.concat
// @feature builtin concat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [])
  if (symbolic.concat().length === 0) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1]));
