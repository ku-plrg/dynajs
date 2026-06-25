// @type concolic
// @target es5 Math.floor
// @feature builtin floor
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__(3.5)
    __IS_SAT__(Math.floor(symbolic) === 3, true);
    

}

__test_symbolic__(__symbolic__('s', 2.5));
