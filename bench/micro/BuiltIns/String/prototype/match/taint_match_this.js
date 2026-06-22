// @type taint
// @target es5 String.prototype.match
// @feature builtin match
// @done

function __test_taint__(tainted) {
    var d1 = 'world';
    var x = tainted + d1;

    var m = x.match(/[a-z]+/);

    // @witness __test_taint__('x') => m[0][0]='x' from tainted
    __assert_taint__(m[0][0], true);

    // @witness always m[0][m[0].length-1]='d' clean suffix from d1
    __assert_taint__(m[0][m[0].length - 1], false);

    // @witness no-match returns null => untaint
    __assert_taint__(x.match(/Q/), false);
}

__test_taint__(__set_taint__('hello'));
