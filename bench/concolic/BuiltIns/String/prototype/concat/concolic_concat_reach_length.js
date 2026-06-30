// @type concolic-replay
// @target es5 String.prototype.concat
// @feature builtin concat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.concat('XY').length === 4) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
