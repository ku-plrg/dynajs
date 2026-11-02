// @type concolic-replay
// @target es5 String.prototype.toString
// @feature builtin toString
// @reach true
// @dynajs-only

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "hi")
  if (symbolic.toString() + '!' === 'hi!') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
