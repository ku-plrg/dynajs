// @type concolic
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_symbolic__(symbolic) {
    if (JSON.stringify(symbolic).includes('a') && typeof symbolic === 'string') {

        __IS_SAT__(!symbolic.includes('a'), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 'abc'));
