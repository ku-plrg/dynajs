// @type taint
// @target es6+ RegExp.prototype[Symbol.matchAll]
// @feature builtin symbol_matchAll

function __test_taint__(tainted) {
    // str = 'a' + tainted + 'c', seed 'b' => "abc"; iterated via RegExp[Symbol.matchAll]
    var str = 'a' + tainted + 'c';
    var m = Array.from(str.matchAll(/b/g))[0];
    // @witness __test_taint__('b') => m[0] = 'b' tainted
    __assert_taint__(m[0], true);

    // clean prefix match stays clean
    var m2 = Array.from(str.matchAll(/a/g))[0];
    // @witness always m2[0] = 'a', clean (from clean prefix)
    __assert_taint__(m2[0], false);
}

__test_taint__(__set_taint__('b'));
