// @type concolic-replay
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "xyz")
  if (symbolic.normalize('NFD') === 'xyz') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
