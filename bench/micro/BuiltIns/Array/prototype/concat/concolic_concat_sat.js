// @type concolic
// @target es5 Array.prototype.concat
// @feature builtin concat

function __test_symbolic__(symbolic) {
    if (symbolic.includes(7)) {
        var result = symbolic.concat([8]);
        // @witness __test_symbolic__([7])
        __IS_SAT__(result.indexOf(99) === -1, true);
    }
}

__test_symbolic__(__symbolic__('s', [7]));
