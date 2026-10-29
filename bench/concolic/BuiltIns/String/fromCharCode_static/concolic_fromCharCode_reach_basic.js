// @type concolic-replay
// @target es5 String.fromCharCode
// @feature builtin fromCharCode
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", 122)
  if (String.fromCharCode(symbolic) === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", 97));
