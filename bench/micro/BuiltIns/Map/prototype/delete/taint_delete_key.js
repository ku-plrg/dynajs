// @type taint
// @target es6 Map.prototype.delete
// @feature builtin delete

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness delete returns boolean => false
    __assert_taint__(m.delete('k'), false);
}

__test_taint__(__set_taint__('hello'));
