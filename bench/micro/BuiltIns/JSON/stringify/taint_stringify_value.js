// @type taint
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_taint__(tainted) {
    // JSON.stringify('ab') => '"ab"' (4 chars)
    var r = JSON.stringify(tainted);

    // @witness r[0] = '"' opening quote inserted by stringify, clean
    __assert_taint__(r[0], false);

    // @witness __test_taint__('ab') => r[1] = 'a' tainted
    __assert_taint__(r[1], true);

    // @witness __test_taint__('ab') => r[2] = 'b' tainted
    __assert_taint__(r[2], true);

    // @witness r[r.length-1] = '"' closing quote inserted by stringify, clean
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('ab'));
