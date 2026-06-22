// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_taint__(tainted) {
    var x = 'hi';

    // @witness 'hi' clean; tainted is only the maxLength bound
    __assert_taint__(x.padEnd(tainted, '.'), false);
}

__test_taint__(__set_taint__(5));
