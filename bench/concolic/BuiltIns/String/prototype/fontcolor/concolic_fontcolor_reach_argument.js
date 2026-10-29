// @type concolic-replay
// @target es5 String.prototype.fontcolor
// @feature builtin fontcolor
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "v")
  if (symbolic.fontcolor(symbolic) === '<font color="v">v</font>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
