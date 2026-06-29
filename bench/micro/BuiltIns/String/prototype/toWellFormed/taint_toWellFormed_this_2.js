// @type taint
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done

function __test_taint__(tainted) {
    var x = 'h' + tainted + 'i';
    var r = x.toWellFormed();

    // @witness __test_taint__('x') => r[1]='x' (tainted char)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('hello'));
