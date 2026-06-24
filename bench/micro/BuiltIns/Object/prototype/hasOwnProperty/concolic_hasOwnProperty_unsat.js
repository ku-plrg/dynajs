// @type concolic
// @target es5 Object.prototype.hasOwnProperty
// @feature builtin hasownproperty

function __test_symbolic__(symbolic) {
    var o = { p: 1 };
    if (symbolic.length > 2) {
        // @witness o owns literal "p" on every path, so !hasOwnProperty("p") cannot hold
        __IS_SAT__(!o.hasOwnProperty("p"), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 'abc'));
