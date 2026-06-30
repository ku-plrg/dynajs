// @type concolic-replay
// @target es5 String.prototype.substr
// @feature builtin substr
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abcd")
  if (symbolic.substr(2, 10) === 'cd') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abcde"));
