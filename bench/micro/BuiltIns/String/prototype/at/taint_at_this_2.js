// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness __test_taint__('x') => x.at(1)='x'
    __assert_taint__(x.at(1), true);
}

__test_taint__(__set_taint__('hello'));
