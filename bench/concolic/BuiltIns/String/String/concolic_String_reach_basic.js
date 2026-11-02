// @type concolic-replay
// @target es5 String
// @feature builtin String
// @reach true
// @dynajs-only

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", 42)
  if (String(symbolic) === '42') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", 7));
