// @type taint
// @target es6+ Map.prototype.get
// @feature builtin get
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness __test_taint__('x') => m.get('k') = 'x' tainted
    __assert_taint__(m.get('k'), true);

    // @witness m.get('absent') = undefined (key not found), clean
    __assert_taint__(m.get('absent'), false);
}

__test_taint__(__set_taint__('hello'));
