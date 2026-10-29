// @type concolic-replay
// @target es5 String.prototype.sub
// @feature builtin sub
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "q")
  if (symbolic.sub() + symbolic === '<sub>q</sub>q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
