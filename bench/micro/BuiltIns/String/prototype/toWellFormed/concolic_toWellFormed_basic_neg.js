// @type concolic
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed


function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__("xyz")
    __IS_SAT__(symbolic.toWellFormed() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
