// @type concolic
// @target es5 Array.prototype.forEach
// @feature builtin forEach

function __test_symbolic__(symbolic) {
    var sum = 0;
    symbolic.forEach(function (v) { sum += v; });
    // @witness __test_symbolic__([4, 6])
    __IS_SAT__(sum === 10, true);
}

__test_symbolic__(__symbolic__('s', [1, 2]));
