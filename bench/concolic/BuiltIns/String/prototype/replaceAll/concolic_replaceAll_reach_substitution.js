// @type concolic-replay
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "aa")
  if (symbolic.replaceAll('a', '<$&>') === '<a><a>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ab"));
