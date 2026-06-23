// @type taint
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_taint__(tainted) {

    var j = '{"k":"' + tainted + '","u":"ab"}';
    var parsed = JSON.parse(j);
    var r = parsed.k;
    var u = parsed.u;

    // @witness parsed has untainted property
    __assert_taint__(parsed, false);

    // @witness __test_taint__('x') => r[0]='x' — content char from tainted nested value
    __assert_taint__(r[0], true);

    // @witness __test_taint__('xx') => r[1]='x' — content char from tainted nested value
    __assert_taint__(r[1], true);

    // @witness untainted property remains untainted
    __assert_taint__(u, false);
}

__test_taint__(__set_taint__('ab'));
