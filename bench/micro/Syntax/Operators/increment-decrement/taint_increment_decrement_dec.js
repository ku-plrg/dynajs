// @type taint
// @target es5 increment-decrement
// @feature syntax increment-decrement

function __test_taint__(tainted) {
    --tainted;
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__(5));
