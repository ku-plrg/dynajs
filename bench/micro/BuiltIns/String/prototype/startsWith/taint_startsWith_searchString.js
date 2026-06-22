// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the search key; startsWith returns a boolean
    __assert_taint__(x.startsWith(tainted), false);
}

__test_taint__(__set_taint__('foo'));
