// @type concolic
// @target es5 Math.ceil
// @feature builtin ceil
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__(4.5)
    __IS_SAT__(Math.ceil(symbolic) === 4, true);
    
}

__test_symbolic__(__symbolic__('s', 5.5));
