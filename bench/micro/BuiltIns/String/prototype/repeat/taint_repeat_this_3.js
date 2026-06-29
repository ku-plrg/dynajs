// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done

function __test_taint__(tainted) {
    var x0 = 'b';
    var x = tainted + x0;
    var r = x.repeat(2);

    // @witness __test_taint__('x') => r[1]='b' (tainted, second copy)
    __assert_taint__(r[x0.length], false);
}

__test_taint__(__set_taint__('a'));
