// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done

function __test_taint__(tainted) {
    var x = 'a.b.c';

    var r = x.replaceAll('.', tainted);

    // @witness __test_taint__('x') => r[1]='x' from tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('Z'));
