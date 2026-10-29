// @type concolic-replay
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","b"])
  if (symbolic.reduceRight(function (a, v) { return a + v; }, '') === 'ba') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));
