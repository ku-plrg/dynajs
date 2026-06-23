// @type taint
// @target es5 JSON.stringify
// @feature builtin stringify

function __test_taint__(tainted) {
    // JSON.stringify('ab') => '"ab"' (4 chars)
    var r = JSON.stringify(tainted);

    // @witness always r[0]='"' — opening quote is structural
    __assert_taint__(r[0], false);

    // @witness __test_taint__('ab') => r[1]='a' — content char from tainted
    __assert_taint__(r[1], true);

    // @witness __test_taint__('ab') => r[2]='b' — content char from tainted
    __assert_taint__(r[2], true);

    // @witness always r[3]='"' — closing quote is structural
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__('ab'));
