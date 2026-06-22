// @type taint
// @target es5 String.prototype.search
// @feature builtin search
// @done

function __test_taint__(tainted) {
    var x0 = 'hello';
    var x = x0 + tainted;

    // @witness search returns a position number, not content
    __assert_taint__(x.search(/[0-9]/), false);

    // @witness not-found returns -1, a sentinel number
    __assert_taint__(x.search(/z/), false);
}

__test_taint__(__set_taint__('1'));
