// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + tainted + x2 + x3 + x4;

    // @witness __test_taint__('x') => x.substr(-4, 3)[0]='x'
    __assert_taint__(x.substr(-4, 3)[0], true);
}

__test_taint__(__set_taint__('q'));
