// @type taint
// @target es5 String.fromCharCode
// @feature builtin fromCharCode
// @done

function __test_taint__(tainted) {
    var r = String.fromCharCode(72, tainted);

    // @witness __test_taint__(120) => r[1]='x' (char content from tainted code)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(113));
