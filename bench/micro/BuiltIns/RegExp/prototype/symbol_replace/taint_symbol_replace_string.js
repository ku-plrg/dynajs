// @type taint
// @target es6+ RegExp.prototype[Symbol.replace]
// @feature builtin symbol_replace

function __test_taint__(tainted) {
    // str = 'a' + tainted + 'c', seed 'b' => "abc"
    // /b/ matches 'b' (tainted), replaced with literal 'X'
    // result: "aXc" — 'a' clean, 'X' literal replacement, 'c' clean
    var str = 'a' + tainted + 'c';
    var r = str.replace(/b/, 'X');

    // @witness always r[0]='a' (clean prefix)
    __assert_taint__(r[0], false);

    // @witness always r[1]='X' (literal replacement string, not tainted)
    __assert_taint__(r[1], false);

    // @witness always r[2]='c' (clean suffix)
    __assert_taint__(r[2], false);

    // tainted region outside matched span stays tainted
    // str2 = 'p' + tainted + 'q', seed 'b' => "pbq", /X/ no match => result="pbq"
    var str2 = 'p' + tainted + 'q';
    var r2 = str2.replace(/X/, 'Y');

    // @witness always r2[0]='p' (clean prefix)
    __assert_taint__(r2[0], false);

    // @witness __test_taint__('b') => r2[1]='b' (tainted, not matched, passes through)
    __assert_taint__(r2[1], true);

    // @witness always r2[2]='q' (clean suffix)
    __assert_taint__(r2[2], false);
}

__test_taint__(__set_taint__('b'));
