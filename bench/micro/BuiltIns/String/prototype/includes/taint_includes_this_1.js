// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + tainted + x2;

    // @witness includes returns a boolean
    __assert_taint__(x.includes('foo'), false);
}

__test_taint__(__set_taint__('o'));
