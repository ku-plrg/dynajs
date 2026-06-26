// @type taint
// @target es6+ Map.prototype.has
// @feature builtin has
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness boolean result, clean
    __assert_taint__(m.has('k'), false);

    // @witness boolean result, clean
    __assert_taint__(m.has(tainted), false);
}

__test_taint__(__set_taint__('hello'));
