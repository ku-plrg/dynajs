// @type concolic
// @target es6+ Array.prototype.at
// @feature builtin at
// @done

function __test_symbolic__(symbolic) {

    // @witness __test_symbolic__(['a', 'b', 'e'])
    __IS_SAT__(symbolic.at(-1) === 'e', true);

}

__test_symbolic__(__symbolic__('s', ['a', 'b', 'c']));
