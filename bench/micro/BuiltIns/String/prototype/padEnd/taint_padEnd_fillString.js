// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness always x.padEnd(4,tainted)[0]='h' (clean receiver)
    __assert_taint__(x.padEnd(4, tainted)[0], false);

    // @witness always x.padEnd(4,tainted)[1]='i' (clean receiver)
    __assert_taint__(x.padEnd(4, tainted)[1], false);

    // @witness __test_taint__('x') => x.padEnd(4,tainted)[2]='x' (tainted fill)
    __assert_taint__(x.padEnd(4, tainted)[2], true);

    // @witness __test_taint__('x') => x.padEnd(4,tainted)[3]='x' (tainted fill)
    __assert_taint__(x.padEnd(4, tainted)[3], true);

}

__test_taint__(__set_taint__('*'));
