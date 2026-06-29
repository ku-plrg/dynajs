// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness always x.padStart(4,tainted)[3]='i' (clean receiver)
    __assert_taint__(x.padStart(4, tainted)[3], false);
}

__test_taint__(__set_taint__('*'));
