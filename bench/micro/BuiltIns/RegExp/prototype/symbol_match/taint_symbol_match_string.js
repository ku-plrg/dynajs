// @type taint
// @target es6+ RegExp.prototype[Symbol.match]
// @feature builtin symbol_match

function __test_taint__(tainted) {
    // str = 'a' + tainted + 'c', seed 'b' => "abc"
    // /b/ matches the tainted region => match[0]='b'
    var str = 'a' + tainted + 'c';
    var m = str.match(/b/);

    // @witness __test_taint__('b') => m[0] = 'b' tainted
    __assert_taint__(m[0], true);

    // @witness __test_taint__('b') => m[0][0] = 'b' tainted
    __assert_taint__(m[0][0], true);

    // clean prefix match stays clean
    var m2 = str.match(/a/);
    // @witness always m2[0] = 'a', clean (from clean prefix)
    __assert_taint__(m2[0], false);
}

__test_taint__(__set_taint__('b'));
