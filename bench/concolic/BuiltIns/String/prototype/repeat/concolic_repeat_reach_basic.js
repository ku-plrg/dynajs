// @type concolic-replay
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "xyz")
  if (symbolic.repeat(2) !== 'abcabc') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
