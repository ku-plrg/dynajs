// @type taint
// @target es6 Map.prototype.has
// @feature builtin has

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness has() returns boolean => false
    __assert_taint__(m.has('k'), false);

    // @witness tainted key used as search key only => boolean false
    __assert_taint__(m.has(tainted), false);
}

__test_taint__(__set_taint__('hello'));
