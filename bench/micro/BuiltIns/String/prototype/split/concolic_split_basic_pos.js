// @type concolic
// @target es5 String.prototype.split
// @feature builtin split
// @done


function __test_symbolic__(symbolic) {

  var p = symbolic.split('-');
  if (p[0] === 'ab') {
    // @witness the p[0]==='ab' guard pins the first char to 'a'
    __IS_SAT__(symbolic[0] !== 'a', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "ab-c"));
