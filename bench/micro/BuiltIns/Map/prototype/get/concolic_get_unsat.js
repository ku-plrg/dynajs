// @type concolic
// @target es6+ Map.prototype.get
// @feature builtin get

function __test_symbolic__(symbolic) {
    var m = new Map();
    m.set("a", 1);
    var v = m.get(symbolic);
    if (v !== undefined) {
        // @witness 1 is the only value stored, so any non-undefined get result must equal 1
        __IS_SAT__(v !== 1, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', "a"));
