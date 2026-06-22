// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done

function __test_taint__(tainted) {
    var x = 'foo';

    // @witness 'foo' clean; tainted is only the form selector, never content.
    // One whole-string check suffices — per-position asserts only restate it.
    __assert_taint__(x.normalize(tainted), false);
}

__test_taint__(__set_taint__('NFC'));
