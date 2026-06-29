// @type taint
// @target es6+ String.prototype.trimStart
// @feature builtin trimStart
// @done

function __test_taint__(tainted) {
    var x0 = 'a';
    var x2 = 'c';
    var x = '  ' + x0 + tainted + x2;
    var r = x.trimStart();

    // @witness always r[0]='a'
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
