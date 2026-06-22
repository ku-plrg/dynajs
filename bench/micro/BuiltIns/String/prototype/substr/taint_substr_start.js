// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr
// @done

function __test_taint__(tainted) {
    var x = 'hello';

    // @witness 'hello' clean; tainted is only the start bound
    __assert_taint__(x.substr(tainted, 3), false);
}

__test_taint__(__set_taint__(1));
