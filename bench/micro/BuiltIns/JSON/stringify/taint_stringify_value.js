// @type taint
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_taint__(tainted) {
    // JSON.stringify('ab') => '"ab"' (4 chars)
    var r = JSON.stringify(tainted);

    // @witness always r[0]='"' — opening quote is structural
    __assert_taint__(r[0], false);

    // @witness __test_taint__('xx') => r[1]='x' — content char from tainted
    __assert_taint__(r[1], true);

    // @witness __test_taint__('xx') => r[2]='x' — content char from tainted
    __assert_taint__(r[2], true);

    // @witness always r[r.length - 1]='"' — closing quote is structural
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('ab'));
