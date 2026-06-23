// @type taint
// @target es6+ Object.getOwnPropertyDescriptors
// @feature builtin getOwnPropertyDescriptors

function __test_taint__(tainted) {
    var o = {p: tainted};
    var descs = Object.getOwnPropertyDescriptors(o);
    // @witness __test_taint__('hello') => descs.p.value = 'hello' tainted
    __assert_taint__(descs.p.value, true);

    var o2 = {p: 'clean'};
    var descs2 = Object.getOwnPropertyDescriptors(o2);
    // @witness always descs2.p.value = 'clean', clean
    __assert_taint__(descs2.p.value, false);
}

__test_taint__(__set_taint__('hello'));
