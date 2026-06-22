// @type concolic
// @target es6+ String.prototype.at
// @feature builtin at
// @done


function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__("bbb")
    __symbolic_assert__(symbolic.at(1) === 'a', false);

}

__test_symbolic__(__symbolic__('s', "aaa"));
