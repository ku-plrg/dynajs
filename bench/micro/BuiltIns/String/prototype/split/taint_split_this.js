// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = tainted + 'X' + 'b';

    var parts = x.split('X');

    // @witness __test_taint__('xx') => parts[0]='xx'
    __assert_taint__(parts[0], true);

    // @witness always parts[parts.length-1]='b'
    __assert_taint__(parts[parts.length - 1], false);

    // @witness __test_taint__('x') => parts[0][0]='x'
    __assert_taint__(parts[0][0], true);

    // @witness always parts[parts.length-1][0]='b'
    __assert_taint__(parts[parts.length - 1][0], false);

    // a tainted MIDDLE field stays tainted; clean neighbours stay clean
    var seg = ('p-' + tainted + '-q').split('-');   // ["p", <tainted>, "q"]
    // @witness always seg[0]='p'
    __assert_taint__(seg[0], false);
    // @witness __test_taint__('x') => seg[1]='x'
    __assert_taint__(seg[1], true);
    // @witness always seg[2]='q'
    __assert_taint__(seg[2], false);
}

__test_taint__(__set_taint__('a'));
