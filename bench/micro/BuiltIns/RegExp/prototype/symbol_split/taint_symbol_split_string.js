// @type taint
// @target es6 RegExp.prototype[Symbol.split]
// @feature builtin symbol_split

function __test_taint__(tainted) {
    // str = 'p' + tainted + 'q', seed 'b' => "pbq"
    // split on /-/ (no match) => ["pbq"] — tainted middle passes through
    var str = 'p' + tainted + 'q';
    var parts = str.split(/-/);

    // @witness always parts[0][0]='p' (clean prefix char)
    __assert_taint__(parts[0][0], false);

    // @witness __test_taint__('b') => parts[0][1]='b' (tainted middle char)
    __assert_taint__(parts[0][1], true);

    // @witness always parts[0][2]='q' (clean suffix char)
    __assert_taint__(parts[0][2], false);

    // split that separates tainted middle field
    // "p-" + tainted + "-q" split on /-/ => ["p", tainted, "q"]
    var str2 = 'p-' + tainted + '-q';
    var seg = str2.split(/-/);

    // @witness always seg[0]='p' (clean field)
    __assert_taint__(seg[0], false);

    // @witness __test_taint__('b') => seg[1]='b' (tainted field)
    __assert_taint__(seg[1], true);

    // @witness always seg[2]='q' (clean field)
    __assert_taint__(seg[2], false);
}

__test_taint__(__set_taint__('b'));
