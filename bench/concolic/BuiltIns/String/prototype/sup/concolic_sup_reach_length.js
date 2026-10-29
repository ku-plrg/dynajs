// @type concolic-replay
// @target es5 String.prototype.sup
// @feature builtin sup
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.sup().length === 14) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ab"));
