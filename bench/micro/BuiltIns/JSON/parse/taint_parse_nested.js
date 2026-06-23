// @type taint
// @target es5 JSON.parse
// @feature builtin parse

function __test_taint__(tainted) {
    // JSON.parse('{"k":"ab"}').k => 'ab'; tainted value flows through parse
    var j = '{"k":"' + tainted + '"}';
    var r = JSON.parse(j).k;

    // @witness __test_taint__('ab') => r[0]='a' — content char from tainted nested value
    __assert_taint__(r[0], true);

    // @witness __test_taint__('ab') => r[1]='b' — content char from tainted nested value
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('ab'));
