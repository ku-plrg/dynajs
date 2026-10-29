// @type concolic-replay
// @target es5 String.prototype.sup
// @feature builtin sup
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "")
  if (symbolic.sup() === '<sup></sup>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
