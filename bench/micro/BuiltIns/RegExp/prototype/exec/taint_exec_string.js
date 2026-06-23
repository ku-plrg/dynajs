// @type taint
// @target es5 RegExp.prototype.exec
// @feature builtin exec
// @done

function __test_taint__(tainted) {
    // seed 'b': str = 'a' + 'b' + 'c', /b/ matches the tainted region
    var str = 'a' + tainted + 'c';
    var r = /b/.exec(str);

    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__('x') => r[0][0] = 'x' tainted
    __assert_taint__(r[0][0], true);

    // clean prefix never tainted
    var r2 = /a/.exec(str);
    // @witness always r2[0] = 'a', clean (clean prefix)
    __assert_taint__(r2[0], false);
}

__test_taint__(__set_taint__('b'));
