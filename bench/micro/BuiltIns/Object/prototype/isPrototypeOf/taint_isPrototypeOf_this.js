// @type taint
// @target es5 Object.prototype.isPrototypeOf
// @feature builtin isPrototypeOf

function __test_taint__(tainted) {
    var proto = {p: tainted};
    var child = Object.create(proto);
    // @witness boolean result, clean
    __assert_taint__(proto.isPrototypeOf(child), false);
    // @witness boolean result, clean
    __assert_taint__(proto.isPrototypeOf({}), false);
}

__test_taint__(__set_taint__('hello'));
