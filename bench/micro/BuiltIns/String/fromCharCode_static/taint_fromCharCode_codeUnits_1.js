// @type taint
// @target es5 String.fromCharCode
// @feature builtin fromCharCode
// @done

function __test_taint__(tainted) {
    var r = String.fromCharCode(72, tainted);

    // @witness always r[0]='H' (from clean code 72)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(113));
