// @type concolic-replay
// @target es5 String.prototype.fontsize
// @feature builtin fontsize
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "v")
  if (symbolic.fontsize(symbolic) === '<font size="v">v</font>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
