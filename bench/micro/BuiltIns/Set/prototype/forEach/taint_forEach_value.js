// @type taint
// @target es6 Set.prototype.forEach
// @feature builtin forEach

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    var got;
    s.forEach(function(v) { got = v; });

    // @witness tainted value flows through forEach callback => tainted
    __assert_taint__(got, true);

    var s2 = new Set();
    s2.add('clean');

    var got2;
    s2.forEach(function(v) { got2 = v; });

    // @witness clean value in forEach callback => clean
    __assert_taint__(got2, false);
}

__test_taint__(__set_taint__('hello'));
