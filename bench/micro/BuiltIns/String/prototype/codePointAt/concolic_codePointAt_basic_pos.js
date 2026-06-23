// @type concolic
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done


function __test_symbolic__(symbolic) {

  // @witness codePointAt(0) is modeled to always return a number
  __IS_SAT__(typeof symbolic.codePointAt(0) !== 'number', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
