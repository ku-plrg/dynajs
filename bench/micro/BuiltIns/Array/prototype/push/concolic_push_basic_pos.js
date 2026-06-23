// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push

function __test_symbolic__(symbolic) {
    if (symbolic.length === 2) {
        symbolic.push(7);
        // @witness push grows length by 1 and lands 7 at the final index
        __IS_SAT__(symbolic.length !== 3 || symbolic[symbolic.length - 1] !== 7, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
