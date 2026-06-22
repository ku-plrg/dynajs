// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the search key; lastIndexOf returns a position number
    __assert_taint__(x.lastIndexOf(tainted), false);
}

__test_taint__(__set_taint__('bar'));
