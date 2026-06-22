// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @done

function __test_taint__(tainted) {
    var x = 'foo';

    // @witness tainted is only the search key; endsWith returns a boolean
    __assert_taint__(x.endsWith(tainted), false);
}

__test_taint__(__set_taint__('o'));
