// @type taint
// @target es5 Object.defineProperty
// @feature builtin defineProperty

function __test_taint__(tainted) {
    var o = {};
    Object.defineProperty(o, 'p', {value: tainted, writable: true, enumerable: true, configurable: true});
    // @witness __test_taint__('hello') => o.p='hello' (tainted value installed)
    __assert_taint__(o.p, true);

    var o2 = {};
    Object.defineProperty(o2, 'p', {value: 'clean', writable: true, enumerable: true, configurable: true});
    // @witness always o2.p='clean' (clean value installed)
    __assert_taint__(o2.p, false);
}

__test_taint__(__set_taint__('hello'));
