// @type taint
// @target es6+ Map.prototype.forEach
// @feature builtin forEach
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);
    var got;
    m.forEach(function(v) { got = v; });

    // @witness __test_taint__('x') => got = 'x' tainted
    __assert_taint__(got, true);
    m.set('k2', 'clean');
    m.forEach(function(v) { got = v; });
    // @witness got is always 'clean' clean
    __assert_taint__(got, false);
}

__test_taint__(__set_taint__('hello'));
