// @type concolic-replay
// @target es5 String.prototype.anchor
// @feature builtin anchor
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", '"')
  if (symbolic.anchor(symbolic) === '<a name="&quot;">"</a>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));
