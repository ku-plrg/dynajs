// @type taint
// @target es6+ Set.prototype.delete
// @feature builtin delete

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness delete() returns a boolean => always clean
    __assert_taint__(s.delete(tainted), false);

    // @witness delete() on absent key => boolean false => clean
    __assert_taint__(s.delete('absent'), false);
}

__test_taint__(__set_taint__('hello'));
