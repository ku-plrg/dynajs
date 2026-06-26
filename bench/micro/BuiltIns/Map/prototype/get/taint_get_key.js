// @type taint
// @target es6+ Map.prototype.get
// @feature builtin get
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set(tainted, 'v');

    // @witness tainted is only the lookup key, value 'v' is clean
    __assert_taint__(m.get(tainted), false);
}

__test_taint__(__set_taint__('hello'));
