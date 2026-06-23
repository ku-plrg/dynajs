// @type taint
// @target es6+ Map.prototype.get
// @feature builtin get

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness __test_taint__('hello') => m.get('k')='hello'
    __assert_taint__(m.get('k'), true);

    // @witness always m.get('absent')=undefined
    __assert_taint__(m.get('absent'), false);
}

__test_taint__(__set_taint__('hello'));
