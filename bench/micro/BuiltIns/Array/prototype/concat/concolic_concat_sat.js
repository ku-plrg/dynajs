// @type concolic
// @target es5 Array.prototype.concat
// @feature builtin concat
// @done

function __test_symbolic__(symbolic) {
        // @witness __test_symbolic__([4])
     __IS_SAT__(symbolic.concat([8]) === [4, 8], true);
    
}

__test_symbolic__(__symbolic__('s', [7]));
