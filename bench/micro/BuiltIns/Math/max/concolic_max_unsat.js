// @type concolic
// @target es5 Math.max
// @feature builtin max

function __test_symbolic__(symbolic) {
    if (symbolic > 5) {
        // @witness the symbolic>5 guard makes max(symbolic,5)=symbolic>5, never <=5
        __IS_SAT__(Math.max(symbolic, 5) <= 5, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 42));
