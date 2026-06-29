// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done

function __test_taint__(tainted) {
    var x0 = 'b';
    var x = tainted + x0;
    var r = x.repeat(2);

    // @witness __test_taint__('x') => r[0]='x' (tainted)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__('a'));
