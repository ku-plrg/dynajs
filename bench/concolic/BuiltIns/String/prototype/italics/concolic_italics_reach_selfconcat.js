// @type concolic-replay
// @target es5 String.prototype.italics
// @feature builtin italics
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "q")
  if (symbolic.italics() + symbolic === '<i>q</i>q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
