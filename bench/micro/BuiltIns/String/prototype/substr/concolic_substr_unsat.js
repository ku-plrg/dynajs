// @type concolic
// @target es5 String.prototype.substr
// @feature builtin substr
// @done

function __test_symbolic__(symbolic) {


    // @witness substr(1, 2) length is less than 3
  __IS_SAT__(symbolic.substr(1, 3).length > 3, false);

}

__test_symbolic__(__symbolic__('s', "abcde"));
