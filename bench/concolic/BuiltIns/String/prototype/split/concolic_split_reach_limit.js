// @type concolic-replay
// @target es5 String.prototype.split
// @feature builtin split
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "q,b")
  if (symbolic.split(',', 1)[0] === 'q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a,b"));
