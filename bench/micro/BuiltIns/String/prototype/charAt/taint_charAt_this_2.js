// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness __test_taint__('x') => x.charAt(1)='x' (first tainted char)
    __assert_taint__(x.charAt(1), true);
}

__test_taint__(__set_taint__('hello'));
