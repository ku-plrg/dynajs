// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done

function __test_taint__(tainted) {
    var x = tainted + 'oo..';

    var r = x.replaceAll('.', 'X');

    // @witness __test_taint__('x') => r[0]='x' from tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__('f'));
