// @type concolic-replay
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abd")
  if (symbolic.normalize() === 'abd') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
