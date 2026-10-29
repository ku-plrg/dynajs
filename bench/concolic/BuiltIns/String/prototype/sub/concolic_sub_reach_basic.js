// @type concolic-replay
// @target es5 String.prototype.sub
// @feature builtin sub
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "hi")
  if (symbolic.sub() === '<sub>hi</sub>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
