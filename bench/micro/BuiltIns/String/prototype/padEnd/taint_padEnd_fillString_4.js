// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness __test_taint__('x') => x.padEnd(4,tainted)[3]='x' (tainted fill)
    __assert_taint__(x.padEnd(4, tainted)[3], true);
}

__test_taint__(__set_taint__('*'));
