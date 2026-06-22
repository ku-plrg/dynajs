// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done

function __test_taint__(tainted) {
    var x = 'ab';

    // @witness 'ab' clean; tainted is only the count bound
    __assert_taint__(x.repeat(tainted), false);
}

__test_taint__(__set_taint__(3));
