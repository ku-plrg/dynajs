// @type taint
// @target es6+ Set.size
// @feature builtin size

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness __test_taint__('hello') => s.size = 1 tainted
    __assert_taint__(s.size, true);

    var s2 = new Set();
    s2.add('a');
    s2.add('b');

    // @witness clean entries => size is clean, clean
    __assert_taint__(s2.size, false);
}

__test_taint__(__set_taint__('hello'));
