// @type taint
// @target es6+ Set.prototype.delete
// @feature builtin delete
// @done

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness boolean result, clean
    __assert_taint__(s.delete(tainted), false);

    // @witness boolean result, clean
    __assert_taint__(s.delete('absent'), false);
}

__test_taint__(__set_taint__('hello'));
