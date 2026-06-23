// @type taint
// @target es6 Map.prototype.forEach
// @feature builtin forEach

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);
    var got;
    m.forEach(function(v) { got = v; });

    // @witness __test_taint__('hello') => got='hello' (tainted value passed to callback)
    __assert_taint__(got, true);
}

__test_taint__(__set_taint__('hello'));
