// @type taint
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase
// @done

function __test_taint__(tainted) {
    var x = 'abc';

    // @witness 'abc' clean; tainted is only the locale selector, never content.
    // One whole-string check suffices — per-position asserts only restate it.
    __assert_taint__(x.toLocaleUpperCase(tainted), false);
}

__test_taint__(__set_taint__('tr'));
