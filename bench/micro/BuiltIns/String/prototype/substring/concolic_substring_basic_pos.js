// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring


function __test_symbolic__(symbolic) {

  if (symbolic.substring(0, 3) === 'abc') {
    // @witness the substring(0,3)==='abc' guard pins index 1 to 'b'
    __IS_SAT__(symbolic.charAt(1) !== 'b', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
