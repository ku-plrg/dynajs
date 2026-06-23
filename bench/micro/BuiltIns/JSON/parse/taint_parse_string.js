// @type taint
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_taint__(tainted) {
    // JSON.parse('"ab"') => 'ab'; tainted chars flow through parse into result
    var j = '"' + tainted + '"';
    var r = JSON.parse(j);

    // @witness __test_taint__('ab') => r[0] = 'a' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__('ab') => r[1] = 'b' tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('ab'));
