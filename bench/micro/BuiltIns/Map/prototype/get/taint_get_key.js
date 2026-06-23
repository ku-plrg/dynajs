// @type taint
// @target es6+ Map.prototype.get
// @feature builtin get

function __test_taint__(tainted) {
    var m = new Map();
    m.set(tainted, 'v');

    // @witness tainted key selects clean value 'v'
    __assert_taint__(m.get(tainted), false);
}

__test_taint__(__set_taint__('hello'));
