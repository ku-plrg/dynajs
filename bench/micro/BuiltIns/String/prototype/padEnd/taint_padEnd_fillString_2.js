// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness always x.padEnd(4,tainted)[1]='i' (clean receiver)
    __assert_taint__(x.padEnd(4, tainted)[1], false);
}

__test_taint__(__set_taint__('*'));
