// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;
    var r = x.normalize('NFC');

    // @witness always r[r.length-1]='i'
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
