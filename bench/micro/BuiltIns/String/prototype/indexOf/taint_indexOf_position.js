// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done

function __test_taint__(tainted) {
    var x = 'foobarbar';

    // @witness tainted is only the fromIndex; indexOf returns a position number
    __assert_taint__(x.indexOf('bar', tainted), false);
}

__test_taint__(__set_taint__(4));
