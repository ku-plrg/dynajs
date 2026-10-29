// @type concolic-replay
// @target es5 String.prototype.fontsize
// @feature builtin fontsize
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "hi")
  if (symbolic.fontsize('x') === '<font size="x">hi</font>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
