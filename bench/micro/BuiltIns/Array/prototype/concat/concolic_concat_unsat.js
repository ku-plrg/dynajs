// @type concolic
// @target es5 Array.prototype.concat
// @feature builtin concat
// @done

function __test_symbolic__(symbolic) {
    if (symbolic.length === 2) {
        var result = symbolic.concat(99);
        // @witness concat appends one arg: length grows by 1
        __IS_SAT__(result.length !== 3 , false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
