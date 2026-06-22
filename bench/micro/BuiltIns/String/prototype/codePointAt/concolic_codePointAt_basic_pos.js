// @type concolic
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done


function __test_symbolic__(symbolic) {

  // @witness codePointAt returns a numeric code point
  __symbolic_assert__(typeof symbolic.codePointAt(0) === 'number', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
