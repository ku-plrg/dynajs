// @type taint
// @target es6 RegExp.source
// @feature builtin source

function __test_taint__(tainted) {
    // tainted pattern string => RegExp(tainted).source returns that pattern's chars
    var re = new RegExp(tainted);
    var s = re.source;

    // @witness __test_taint__('b') => s[0]='b' (content from tainted pattern)
    __assert_taint__(s[0], true);

    // literal-pattern variant: source is fixed, not tainted
    var re2 = /ab/;
    var s2 = re2.source;

    // @witness always s2[0]='a' (from literal pattern, not tainted)
    __assert_taint__(s2[0], false);

    // @witness always s2[1]='b' (from literal pattern, not tainted)
    __assert_taint__(s2[1], false);
}

__test_taint__(__set_taint__('b'));
