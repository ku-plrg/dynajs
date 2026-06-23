// @type taint
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_taint__(tainted) {
    // JSON.parse('"ab"') => 'ab'; tainted chars flow through parse into result
    var j = '"' + tainted + '"';
    var r = JSON.parse(j);

    // @witness __test_taint__('x') => r[0]='x' — content char from tainted input
    __assert_taint__(r[0], true);

    // @witness __test_taint__('xx') => r[1]='x' — content char from tainted input
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('ab'));
