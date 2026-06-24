// @type concolic
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_symbolic__(symbolic) {

        // @witness __test_symbolic__("bbb")
        __IS_SAT__(!JSON.stringify(symbolic).includes('a'), true);
}

__test_symbolic__(__symbolic__('s', 'ab'));
