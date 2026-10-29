// @type concolic-replay
// @target es5 String.prototype.link
// @feature builtin link
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "hi")
  if (symbolic.link('x') === '<a href="x">hi</a>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
