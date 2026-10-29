// @type concolic-replay
// @target es5 Array.prototype.map
// @feature builtin map
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","y"])
  if (symbolic.map(function (x) { return x + '!'; })[0] === 'a!') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));
