// @type taint
// @target es5 Object.getPrototypeOf
// @feature builtin getPrototypeOf

function __test_taint__(tainted) {
    var proto = {p: tainted};
    var child = Object.create(proto);
    var got = Object.getPrototypeOf(child);
    // @witness __test_taint__('hello') => getPrototypeOf(child).p='hello' (tainted prop on proto)
    __assert_taint__(got.p, true);

    var proto2 = {p: 'clean'};
    var child2 = Object.create(proto2);
    var got2 = Object.getPrototypeOf(child2);
    // @witness always getPrototypeOf(child2).p='clean' (clean prop on proto)
    __assert_taint__(got2.p, false);
}

__test_taint__(__set_taint__('hello'));
