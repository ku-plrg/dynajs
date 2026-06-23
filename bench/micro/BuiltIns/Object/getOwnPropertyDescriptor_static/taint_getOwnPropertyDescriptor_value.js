// @type taint
// @target es5 Object.getOwnPropertyDescriptor
// @feature builtin getOwnPropertyDescriptor

function __test_taint__(tainted) {
    var o = {p: tainted};
    var desc = Object.getOwnPropertyDescriptor(o, 'p');
    // @witness __test_taint__('hello') => desc.value = 'hello' tainted
    __assert_taint__(desc.value, true);

    var o2 = {p: 'clean'};
    var desc2 = Object.getOwnPropertyDescriptor(o2, 'p');
    // @witness always desc2.value = 'clean', clean
    __assert_taint__(desc2.value, false);
}

__test_taint__(__set_taint__('hello'));
