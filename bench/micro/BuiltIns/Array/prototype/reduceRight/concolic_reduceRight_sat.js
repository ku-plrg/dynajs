// @type concolic
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__([3, 7])
    __IS_SAT__(symbolic.reduceRight(function (a, v) { return a + v; }, 0) === 10, true);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
