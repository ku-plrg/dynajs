// @type concolic
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done


function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__("\ud800")
    __IS_SAT__(symbolic.toWellFormed() !== '�', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
