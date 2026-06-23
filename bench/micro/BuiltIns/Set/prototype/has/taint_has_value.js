// @type taint
// @target es6+ Set.prototype.has
// @feature builtin has

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness has() returns a boolean => always clean
    __assert_taint__(s.has(tainted), false);

    // @witness has() on absent key => boolean false => clean
    __assert_taint__(s.has('absent'), false);
}

__test_taint__(__set_taint__('hello'));
