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

    // @witness always r[r.length-1]='b' (clean suffix)
    __assert_taint__(r[r.length - 1], false);

    // @witness __test_taint__('x') => r[1]='b' (tainted, second copy)
    __assert_taint__(r[x0.length], false);

    // @witness always x.repeat(0)='' empty
    __assert_taint__(x.repeat(0), false);
}

__test_taint__(__set_taint__('a'));
