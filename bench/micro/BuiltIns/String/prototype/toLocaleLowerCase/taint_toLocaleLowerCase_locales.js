// @type taint
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase
// @done

function __test_taint__(tainted) {
    var x = 'ABC';

    // @witness 'ABC' clean; tainted is only the locale selector, never content.
    // One whole-string check suffices — per-position asserts only restate it.
    __assert_taint__(x.toLocaleLowerCase(tainted), false);
}

__test_taint__(__set_taint__('tr'));
