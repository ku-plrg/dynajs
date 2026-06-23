// @type taint
// @target es5 JSON.parse
// @feature builtin parse
// @done

function __test_taint__(tainted) {

    var j = '{"k":"' + tainted + '","u":"ab"}';
    var parsed = JSON.parse(j);
    var r = parsed.k;
    var u = parsed.u;

    // @witness parsed object is mixed (tainted + clean), clean
    __assert_taint__(parsed, false);

    // @witness __test_taint__('ab') => r[0] = 'a' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__('ab') => r[1] = 'b' tainted
    __assert_taint__(r[1], true);

    // @witness u = 'ab' from clean literal, clean
    __assert_taint__(u, false);
}

__test_taint__(__set_taint__('ab'));
