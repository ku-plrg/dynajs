// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + tainted + x2;

    // @witness startsWith returns a boolean
    __assert_taint__(x.startsWith('foo'), false);
}

__test_taint__(__set_taint__('ooo'));
