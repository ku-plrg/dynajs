// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done 

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the search key; indexOf returns a position number
    __assert_taint__(x.indexOf(tainted), false);
}

__test_taint__(__set_taint__('bar'));
