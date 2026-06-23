// @type taint
// @target es6 Map.size
// @feature builtin size

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness size is count, attacker controls entry count via tainted value
    __assert_taint__(m.size, true);
}

__test_taint__(__set_taint__('hello'));
