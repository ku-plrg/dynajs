// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done

function __test_symbolic__(symbolic) {

    __IS_SAT__(symbolic.join("-").length === 1, false);

}

__test_symbolic__(__symbolic__('s', [1, 2]));
