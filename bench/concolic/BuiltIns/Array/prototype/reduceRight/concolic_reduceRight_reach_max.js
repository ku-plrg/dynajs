// @type concolic-replay
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.reduceRight(function (a, v) { return a > v ? a : v; }) === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));
