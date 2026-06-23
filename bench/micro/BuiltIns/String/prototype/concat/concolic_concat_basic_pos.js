// @type concolic
// @target es5 String.prototype.concat
// @feature builtin concat
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.concat('Z');

  // @witness concat('Z') always ends in 'Z'
  __IS_SAT__(r[r.length - 1] !== 'Z', false);


}

__test_symbolic__(__symbolic__('s', "abc"));
