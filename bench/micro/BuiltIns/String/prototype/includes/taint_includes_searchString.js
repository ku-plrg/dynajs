// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the search key; includes returns a boolean
    __assert_taint__(x.includes(tainted), false);
}

__test_taint__(__set_taint__('bar'));
