// @type taint
// @target es5 String length
// @feature builtin length
// @done

function __test_taint__(tainted) {
    var x = tainted;

    // @witness __test_taint__('x'.repeat(42)) => x.length=42 (attacker-controlled count)
    __assert_taint__(x.length, true);
}

__test_taint__(__set_taint__('x'.repeat(20)));
