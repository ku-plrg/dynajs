// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the position index; startsWith returns a boolean
    __assert_taint__(x.startsWith('bar', tainted), false);
}

__test_taint__(__set_taint__(3));
