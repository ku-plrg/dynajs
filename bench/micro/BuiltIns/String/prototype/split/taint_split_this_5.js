// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = tainted + 'X' + 'b';

    var parts = x.split('X');

    // a tainted MIDDLE field stays tainted; clean neighbours stay clean
    var seg = ('p-' + tainted + '-q').split('-');   // ["p", <tainted>, "q"]
    // @witness always seg[0]='p'
    __assert_taint__(seg[0], false);
}

__test_taint__(__set_taint__('a'));
