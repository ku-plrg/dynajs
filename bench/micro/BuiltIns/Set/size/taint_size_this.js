// @type taint
// @target es6 Set.size
// @feature builtin size

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness attacker controls entry count => size is tainted (count rule)
    __assert_taint__(s.size, true);

    var s2 = new Set();
    s2.add('a');
    s2.add('b');

    // @witness clean entries => size is clean
    __assert_taint__(s2.size, false);
}

__test_taint__(__set_taint__('hello'));
