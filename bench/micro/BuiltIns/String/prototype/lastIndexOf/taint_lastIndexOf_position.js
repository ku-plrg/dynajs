// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done

function __test_taint__(tainted) {
    var x = 'barbarfoo';

    // @witness tainted is only the fromIndex; lastIndexOf returns a position number
    __assert_taint__(x.lastIndexOf('bar', tainted), false);
}

__test_taint__(__set_taint__(3));
