// @type concolic-replay
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abab")
  if (symbolic.replaceAll('ab', 'x') === 'xx') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
