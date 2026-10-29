// @type concolic-replay
// @target es5 String.prototype.italics
// @feature builtin italics
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "")
  if (symbolic.italics() === '<i></i>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));
