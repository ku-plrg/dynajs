// @type concolic
// @target es5 String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.charCodeAt(0) === 97) {
    //@witness charCodeAt(0)===97 guard requires index 0, so length>=1
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
