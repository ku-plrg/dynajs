// @type taint
// @target es6 RegExp.prototype[Symbol.search]
// @feature builtin symbol_search

function __test_taint__(tainted) {
    // str = 'a' + tainted + 'c', seed 'b' => "abc"
    // /b/.search returns index 1 — a POSITION number
    var str = 'a' + tainted + 'c';
    var idx = str.search(/b/);

    // @witness always search() returns a position index, not content
    __assert_taint__(idx, false);

    // clean prefix search also position
    var idx2 = str.search(/a/);
    // @witness always search() returns a position index
    __assert_taint__(idx2, false);
}

__test_taint__(__set_taint__('b'));
