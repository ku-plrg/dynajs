// @type concolic
// @target es5 Object.prototype.hasOwnProperty
// @feature builtin hasownproperty

function __test_symbolic__(symbolic) {
    var proto = { a: 1 };
    var child = Object.create(proto);
    child.b = 2;
    if (symbolic.length >= 1) {
        // @witness __test_symbolic__("x")
        __IS_SAT__(!child.hasOwnProperty("a") && ("a" in child), true);
    }
}

__test_symbolic__(__symbolic__('s', 'x'));
