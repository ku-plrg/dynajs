// @type taint
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_taint__(tainted) {
    // JSON.stringify({k:'ab'}) => '{"k":"ab"}' (10 chars)
    var r = JSON.stringify({ k: tainted });

    // @witness r[0] = '{' structural brace inserted by stringify, clean
    __assert_taint__(r[0], false);

    // @witness r[1] = '"' structural key-open quote inserted by stringify, clean
    __assert_taint__(r[1], false);

    // @witness r[2] = 'k' clean key char, clean
    __assert_taint__(r[2], false);

    // @witness r[4] = ':' structural colon inserted by stringify, clean
    __assert_taint__(r[4], false);

    // @witness r[5] = '"' structural value-open quote inserted by stringify, clean
    __assert_taint__(r[5], false);

    // @witness __test_taint__('ab') => r[6] = 'a' tainted
    __assert_taint__(r[6], true);

    // @witness r[r.length-2] = '"' structural value-close quote inserted by stringify, clean
    __assert_taint__(r[r.length - 2], false);

    // @witness r[r.length-1] = '}' structural brace inserted by stringify, clean
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('ab'));
