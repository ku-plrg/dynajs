// @type taint
// @target es5 Object.prototype.propertyIsEnumerable
// @feature builtin propertyIsEnumerable

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness boolean result, clean
    __assert_taint__(o.propertyIsEnumerable('p'), false);
    // @witness boolean result, clean
    __assert_taint__(o.propertyIsEnumerable('absent'), false);
}

__test_taint__(__set_taint__('hello'));
