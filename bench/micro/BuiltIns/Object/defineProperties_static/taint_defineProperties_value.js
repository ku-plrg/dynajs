// @type taint
// @target es5 Object.defineProperties
// @feature builtin defineProperties

function __test_taint__(tainted) {
    var o = {};
    Object.defineProperties(o, {p: {value: tainted, writable: true, enumerable: true, configurable: true}});
    // @witness __test_taint__('hello') => o.p = 'hello' tainted
    __assert_taint__(o.p, true);

    var o2 = {};
    Object.defineProperties(o2, {p: {value: 'clean', writable: true, enumerable: true, configurable: true}});
    // @witness always o2.p = 'clean', clean
    __assert_taint__(o2.p, false);
}

__test_taint__(__set_taint__('hello'));
