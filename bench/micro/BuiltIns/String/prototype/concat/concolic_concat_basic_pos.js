// @type concolic
// @target es5 String.prototype.concat
// @feature builtin concat
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.concat('Z');

  // @witness last character of r is always 'Z' 
  __symbolic_assert__(r[r.length - 1] === 'Z', true);


}

__test_symbolic__(__symbolic__('s', "abc"));
