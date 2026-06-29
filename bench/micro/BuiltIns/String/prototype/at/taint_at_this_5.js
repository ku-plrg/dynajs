// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness __test_taint__('xx') => x.at(-2)='x'
    __assert_taint__(x.at(-2), true);
}

__test_taint__(__set_taint__('hello'));
