// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness __test_taint__('x') => x.padStart(4,tainted)[0]='x' (tainted fill)
    __assert_taint__(x.padStart(4, tainted)[0], true);
}

__test_taint__(__set_taint__('*'));
